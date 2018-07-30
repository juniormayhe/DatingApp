using System;
using System.Collections.Generic;
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

    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository repo, IMapper mapper)
        {
            _mapper = mapper;
            _repo = repo;

        }

        // User params could have a hint [FromQuery] to get querystring
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            //get the user looged in for filtering
            //ClaimTypes.NameIdentifier is the property we use for the ID
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser(currentUserId);
            userParams.UserId = currentUserId; 
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female": "male";
            }

            var users = await _repo.GetUsers(userParams);
            var usersToReturn = _mapper.Map<IEnumerable<UserForListDto>>(users);
            //add Pagination custom header
            Response.AddPagination(users.CurrentPage, users.PageSize,
                users.TotalCount, users.TotalPages);

            return Ok(usersToReturn);
        }

        // we add a route name so it matches the routename declared in CreatedAtRoute of AuthController Register
        [HttpGet("{id}", Name="GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _repo.GetUser(id);
            var userToReturn = _mapper.Map<UserForDetailedDto>(user);
            return Ok(userToReturn);
        }
        
        //api/users/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserForUpdateDto userForUpdateDto)
        {
            if (!ModelState.IsValid){
                return BadRequest(ModelState);
            }

            var userFromRepo = await _repo.GetUser(id);
            if (userFromRepo == null)
                return NotFound($"Could not find user with ID of {id}");

            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            //compare current user id match the user from repo to avoid logged user update other people profile
            if (currentUserId != userFromRepo.Id){
                return Unauthorized();
            }
            //map userforDto to user from repo
            _mapper.Map(userForUpdateDto, userFromRepo);
            if (await _repo.SaveAll()){
                return NoContent(); //success
            }
            throw new Exception($"Updating user {id} failed on save");
        }

        [HttpPost("{userId}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int userId, int recipientId){

            //user cannot like him/herself
            if (recipientId == userId){
                return BadRequest(new { message = $"Current user {userId} cannot like himself/herself" });
            }

            //get the user looged in
            //ClaimTypes.NameIdentifier is the property we use for the ID
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();

            var like = await _repo.GetLike(userId, recipientId);
            if (like != null)
                return BadRequest("You already like this user");

            //check if recipient (likee) does not exist
            if (await _repo.GetUser(recipientId) == null)
                return NotFound();

            like = new Like {
                LikerId = userId,
                LikeeId = recipientId
            };

            _repo.Add<Like>(like);

            if (await _repo.SaveAll())
                return Ok();
                
            return BadRequest("Could not like user");
        }

        [HttpGet("{userId}/alreadyliked/{recipientId}")]
        public async Task<IActionResult> GetAlreadyLikedUser(int userId, int recipientId)
        {
            var like = await _repo.GetLike(userId, recipientId);
            if (like != null){
                return Ok(true);
            }
            return Ok(false);
        }
    }
}