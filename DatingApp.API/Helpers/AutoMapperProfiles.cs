using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    // try to setup automapper model to dtos, some fields like age will not be mapped
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            //filter user to leave a small set of properties for UI
            CreateMap<User, UserForListDto>()
                //instructions to populate a particular member such as main photo url
                .ForMember(
                    destination => destination.PhotoUrl, 
                    options=> options.MapFrom(source => source.Photos.FirstOrDefault(p=>p.IsMain).Url)
                )
                .ForMember(
                    destination => destination.Age,
                    options => options.ResolveUsing(d=>d.DateOfBirth.CalculateAge())
                );
            CreateMap<User, UserForDetailedDto>()
                .ForMember(
                    destination => destination.PhotoUrl, 
                    options=> options.MapFrom(source => source.Photos.FirstOrDefault(p=>p.IsMain).Url)
                )
                .ForMember(
                    destination => destination.Age,
                    options => options.ResolveUsing(d=>d.DateOfBirth.CalculateAge())
                );;
            CreateMap<Photo, PhotosForDetailedDto>();
            //update user with info filled in userForUpdate
            CreateMap<UserForUpdateDto, User>();
            //photo for creation
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<Photo, PhotoForReturnDto>();
            // user registration
            CreateMap<UserForRegisterDto, User>();
            // send Message to ef and convert it back to MessageForCreation with ReverseMap. 
            CreateMap<MessageForCreationDto, Message>().ReverseMap();
            //inbox, outbox messages
            CreateMap<Message, MessageToReturnDto>()
                .ForMember(messageToReturnDto => messageToReturnDto.SenderPhotoUrl, // setup sender with first main photo in Photos
                        options => options.MapFrom(message => message.Sender.Photos.FirstOrDefault(p => p.IsMain).Url))
                .ForMember(messageToReturnDto => messageToReturnDto.RecipientPhotoUrl, // setup recipient with first main photo in Photos
                        options => options.MapFrom(message => message.Recipient.Photos.FirstOrDefault(p => p.IsMain).Url));
            
        }
    }
}