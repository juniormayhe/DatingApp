using System;
using System.ComponentModel.DataAnnotations;

namespace DatingApp.API.Dtos
{
    //dtos are used to filter data for client consumption
    public class MessageForCreationDto
    {

        public int SenderId { get; set; }
        
        
        public int RecipientId { get; set; }
        
        public DateTime MessageSent { get; set; }
        
        public string Content { get; set; }
        public MessageForCreationDto()
        {
            MessageSent= DateTime.Now;
            
        }
    }
}