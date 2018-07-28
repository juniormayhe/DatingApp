using System;

namespace DatingApp.API.Dtos
{
    //dtos are used to filter data for client consumption
    //this dto must be setup at AutoMapperProfiles
    public class PhotosForDetailedDto
    {
        
        public int Id { get; set; }
        public string Url  { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsMain { get; set; }
    }
}