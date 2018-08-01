using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{

    [ServiceFilter(typeof(LogUserActivity))]// adds action filter to controller
    [Authorize]
    [Route("api/users/{userId}/[controller]")]
    public class MessagesController : Controller
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public MessagesController(IDatingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;

        }

        // we add a route name so it matches the routename declared in CreatedAtRoute of AuthController Register
        [HttpGet("{messageId}", Name="GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int messageId)
        {
            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messageFromRepo = await _repo.GetMessage(messageId);
            if (messageFromRepo == null)
                return NotFound();
            
            return Ok(messageFromRepo);
        }

        //get params from querystring
        [HttpGet]
        public async Task<IActionResult> GetMessagesForUser(int userId, [FromQuery]MessageParams messageParams)
        {
            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            messageParams.UserId = userId;

            var messagesFromRepo = await _repo.GetMessagesForUser(messageParams);
            
            var messages = _mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);
            
            //add pagination info in response header
            Response.AddPagination(messagesFromRepo.CurrentPage, 
                messagesFromRepo.PageSize,
                messagesFromRepo.TotalCount,
                messagesFromRepo.TotalPages);

            return Ok(messages);
        }

        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessagesThread(int userId, int recipientId)
        {
            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var messagesFromRepo = await _repo.GetMessageThread(userId, recipientId);
            
            var messageThread = _mapper.Map<IEnumerable<MessageToReturnDto>>(messagesFromRepo);

            return Ok(messageThread);
        }

        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, [FromBody]MessageForCreationDto messageForCreationDto)
        {
            var sender = await _repo.GetUser(userId);
            
            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (sender?.Id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            messageForCreationDto.SenderId = userId;
            var recipient = await _repo.GetUser(messageForCreationDto.RecipientId);
            if (recipient == null)
                return BadRequest(new {message = "Could not find user"});
            
            //add this in autmapperProfiles before casting to Message
            var message = _mapper.Map<Message>(messageForCreationDto);
            
            //we are not querying the db so this method is not async
            _repo.Add(message);
            
            if (await _repo.SaveAll()) {
                var messageToReturn = _mapper.Map<MessageToReturnDto>(message);

                //pass the location GetMessage where resource will be available
                return CreatedAtRoute("GetMessage", new { messageId = message.Id }, messageToReturn);
            }
            //why is not being returned BadRequest?
            throw new Exception("Creating message failed on save");

        }

        [HttpPost("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int userId, int messageId)
        {
            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            
            var messageFromRepo = await _repo.GetMessage(messageId);

            if (messageFromRepo.SenderId == userId)
                messageFromRepo.SenderDeleted = true;

            if (messageFromRepo.RecipientId == userId)
                messageFromRepo.RecipientDeleted = true;

            if (messageFromRepo.SenderDeleted && messageFromRepo.RecipientDeleted)
                _repo.Delete(messageFromRepo);
            
            if (await _repo.SaveAll())
                return NoContent();

            //why not bad request?
            throw new Exception("Error deleting message");
		}

        [HttpPost("{messageId}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int userId, int messageId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();  

            var message = await _repo.GetMessage(messageId);

            if (message.RecipientId != userId)
                return Unauthorized();

            message.IsRead = true;
            message.DateRead = DateTime.Now;

            await _repo.SaveAll();

            return NoContent();
        }
    }
}