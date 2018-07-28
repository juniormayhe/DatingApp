namespace DatingApp.API.Dtos
{
    //dtos are used to filter data for client consumption
    public class UserForLoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}