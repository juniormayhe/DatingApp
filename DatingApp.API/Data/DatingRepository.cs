using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    // this repo must be injected in Startup
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;
        public DatingRepository(DataContext context)
        {
            _context = context;

        }
        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(p => p.Id == id);
            return photo;
        }
        public async Task<Photo> GetMainPhoto(int userId)
        {
            var mainPhoto = await _context.Photos.FirstOrDefaultAsync(p => p.UserId == userId && p.IsMain == true);
            return mainPhoto;
        }

        public async Task<User> GetUser(int id)
        {
            var user = await _context.Users
                .Include(l => l.Likees)
                .Include(l => l.Likers)
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(u => u.Id == id);
 
            return user;
        }

        // api/users?gender=female&pageSize=2&minAge=58 shows 2 male users with 58 years 
        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users =  _context.Users.Include(p => p.Photos)
                            .OrderByDescending(u => u.LastActive).AsQueryable()
                    .Where(u=> u.Id != userParams.UserId) // avoid showing logged in user in list
                    .Where(u=> u.Gender == userParams.Gender); // tell current user sex to show opposite
            
            // get list of users that current user has liked
            if (userParams.Likers){
                var userLikers = await getUserLikers(userParams.UserId);
                users = users.Where(u => userLikers.Any(liker=> liker.LikerId == u.Id));
            }

            //users who liked current user
            if (userParams.Likees){
                var userLikees = await getUserLikees(userParams.UserId);
                users = users.Where(u => userLikees.Any(likee => likee.LikeeId == u.Id));
            }

            if (userParams.MinAge !=18 || userParams.MaxAge != 99) {
                // calculate minimum date of birth
                var minDateOfBirth = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDateOfBirth = DateTime.Today.AddYears(-userParams.MinAge);
                users = users.Where(u=> u.DateOfBirth >= minDateOfBirth && u.DateOfBirth <= maxDateOfBirth);
            }
            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }
            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        
        //likers are people who liked current user
        private async Task<IEnumerable<Like>> getUserLikers(int id) {
            var user = await GetUser(id); 
            var userLikers = user.Likers.Where(u => u.LikeeId == id).ToList();
            return userLikers;
        }
 
        //users current user has liked
        private async Task<IEnumerable<Like>> getUserLikees(int id) {
            var user = await GetUser(id); 
            var userLikees = user.Likees.Where(u => u.LikerId == id).ToList();
            return userLikees;
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _context.Likers.FirstOrDefaultAsync(u => u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages
                .Include(u => u.Sender).ThenInclude(sender => sender.Photos)
                .Include(u => u.Recipient).ThenInclude(recipient=> recipient.Photos)
                .AsQueryable();
            
            switch (messageParams.MessageContainer){
                case "Inbox":
                    messages = messages.Where(m => m.RecipientId == messageParams.UserId 
                                                && m.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(m => m.SenderId == messageParams.UserId 
                                                && m.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(m=> m.RecipientId == messageParams.UserId 
                                                && m.RecipientDeleted == false && m.IsRead ==false);
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);
            return await PagedList<Message>.CreateAsync(messages, 
                                                    messageParams.PageNumber, 
                                                    messageParams.PageSize);
        }

        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await _context.Messages
                .Include(u => u.Sender).ThenInclude(sender => sender.Photos)
                .Include(u => u.Recipient).ThenInclude(recipient=> recipient.Photos)
                .Where(m => m.RecipientId == userId && m.RecipientDeleted == false 
                        && m.SenderId == recipientId 
                        || m.RecipientId == recipientId  && m.SenderDeleted == false 
                        && m.SenderId == userId)
                .OrderByDescending(m => m.MessageSent)
                .ToListAsync();
                
            return messages;
        }
    }
}