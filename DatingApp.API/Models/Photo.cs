using System;

namespace DatingApp.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url  { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsMain { get; set; }
        
        // Cloudinary public Id
        public string PublicId { get; set; }
        
        // by adding explicit user here, 
        // entity framework will generate a delete cascade User->Photos
        public User User { get; set; }

        public int UserId { get; set; }

    }
}