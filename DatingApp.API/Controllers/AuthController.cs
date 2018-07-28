using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly IMapper _mapper;
        private readonly IAuthRepository _authRepository;
        private readonly IConfiguration _config;
        public AuthController(IAuthRepository authRepository, 
                            IConfiguration config,
                            IMapper mapper)
        {
            this._config = config;
            this._authRepository = authRepository;
            this._mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody]UserForRegisterDto userForRegisterDto)
        {
            if (!string.IsNullOrEmpty(userForRegisterDto.Username))
                userForRegisterDto.Username = userForRegisterDto.Username.ToLower();
            
            if (await _authRepository.UserExists(userForRegisterDto.Username))
                ModelState.AddModelError("Username", "Username already exists");

            //validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // replaced by automapper 
            // var userToCreate = new User
            // {
            //     Username = userForRegisterDto.Username
            // };
            var userToCreate = _mapper.Map<User>(userForRegisterDto);

            var createdUser = await _authRepository.Register(userToCreate, userForRegisterDto.Password);
            
            //return the created user filtered without the password to client
            var userToReturn = _mapper.Map<UserForDetailedDto>(createdUser);

            // first argument route name here is a route that exists in UsersController
            // second argument route values, instructing GetUser which is the controller and what is the userId  
            // third argument is the user object created to be returned to client without sensitve info
            return CreatedAtRoute("GetUser", new { Controller="Users", id = createdUser.Id}, userToReturn);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody]UserForLoginDto userForLoginDto)
        {

           if (!ModelState.IsValid) { 
               return BadRequest(ModelState);
           }

            var userFromRepo = await _authRepository.Login(userForLoginDto.Username.ToLower(), userForLoginDto.Password);

            if (userFromRepo == null)
                 return Unauthorized();

            //generate token for user
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_config["AppSettings:Token"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, userFromRepo.Id.ToString()),
                    new Claim(ClaimTypes.Name, userFromRepo.Username)
                }),
                //Audience="", if were to Validate Audience, set it here and set ValidateAudience=True in Startup.cs
                //Issuer = "", if were to Validate Issuer, set it here and set ValidateIssuer=True in Startup.cs
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            
            //filter properties without password and photos
            var filteredUser = _mapper.Map<UserForListDto>(userFromRepo);

            return Ok(new { tokenString, filteredUser });//return createdatroute tells where the resource was created
        }
    }
}