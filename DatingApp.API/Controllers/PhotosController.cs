using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    public class PhotosController : Controller
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private Cloudinary _cloudinary;
        
        public PhotosController(IDatingRepository repo, 
            IMapper mapper, 
            IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _repo = repo;
            _mapper = mapper;
            _cloudinaryConfig = cloudinaryConfig;

            Account account = new Account(
                _cloudinaryConfig.Value.CloudName,
                _cloudinaryConfig.Value.ApiKey,
                _cloudinaryConfig.Value.ApiSecret
            );
            _cloudinary= new Cloudinary(account);
        }

        [HttpGet("{id}", Name="GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id){
            var photoFromRepo = await _repo.GetPhoto(id);
            var photo = _mapper.Map<PhotoForReturnDto>(photoFromRepo);
            return Ok(photo);   
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, PhotoForCreationDto photoDto){
            var user = await _repo.GetUser(userId);
            if (user == null)
                return BadRequest("Could not find user");
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            if (currentUserId != userId)
            {
                return Unauthorized();
            }

            //upload to cloudinary and get results
            var file = photoDto.File;
            var uploadResults = new ImageUploadResult();
            if (file.Length >0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams() 
                    {
                        File = new FileDescription(file.Name, stream),
                        //tell cloudinary to crop photo as a square around the face and constraint to maximum dimensions
                        Transformation =  new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };
                    uploadResults = _cloudinary.Upload(uploadParams);
                }
            }
            photoDto.Url = uploadResults.Uri.ToString();
            photoDto.PublicId = uploadResults.PublicId;
            
            //convert photoDto to Photo
            var photo = _mapper.Map<Photo>(photoDto);
            photo.User = user;

            //if there is no main photo, this will be the main one
            if (!user.Photos.Any(m=> m.IsMain)){
                photo.IsMain = true;
            }
            user.Photos.Add(photo);
            if (await _repo.SaveAll()){
                var photoToReturn = _mapper.Map<PhotoForReturnDto>(photo);

                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }

            return BadRequest("Could not add the photo");

        }

        [HttpPost("{photoId}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int photoId) {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)){
                return Unauthorized();
            }

            // it seems you can read a photo from ANY user, since you passed a custom photoId
            var photoFromRepo = await _repo.GetPhoto(photoId);
            if (photoFromRepo==null)
                return NotFound();

            if (photoFromRepo.IsMain)
                return BadRequest("This is already the main Photo");
            
            // we have to check if the userId is the owner of the photo from repo
            if (photoFromRepo.UserId != userId)
                return BadRequest($"The current user {userId} cannot set a main photo from another user {photoFromRepo.UserId}");

            //if current photo is main, set its main as false
            var currentMainPhoto = await _repo.GetMainPhoto(userId);
            if (currentMainPhoto != null)
                currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if (await _repo.SaveAll()){
                return NoContent();
            }

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{photoId}")]
        public async Task<IActionResult> Delete(int userId, int photoId) { 
            
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value)){
                return Unauthorized();
            }

            // it seems you can read a photo from ANY user, since you passed a custom photoId
            var photoFromRepo = await _repo.GetPhoto(photoId);
            if (photoFromRepo==null)
                return NotFound();

            //if (photoFromRepo.IsMain)
            //    return BadRequest("You cannot delete the main photo");
            
            bool mustDeleteFromDatabase = false; 
            if (photoFromRepo.PublicId != null) {
                //delete from cloudinary
                var deleteParams = new DeletionParams(photoFromRepo.PublicId);
                //then delete from database
                var result = _cloudinary.Destroy(deleteParams);
                if (result.Result == "ok"){
                    mustDeleteFromDatabase = true;
                }
            }
            else {
                //if there is no publicid, it means image is only on db and not on cloudinary
                mustDeleteFromDatabase = true;    
            }

            if (mustDeleteFromDatabase) {
                _repo.Delete(photoFromRepo);
                if (await _repo.SaveAll()){
                    return Ok();
                }
            }
            return BadRequest("Failed to delete the photo");
        }

    }
}