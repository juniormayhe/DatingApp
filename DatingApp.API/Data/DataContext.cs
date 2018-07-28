using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    // if you add model classes, run
    // dotnet ef migrations add NameOfTheChange
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Value> Values {get;set;}
        public DbSet<User> Users {get;set;}
        
        public DbSet<Photo> Photos {get;set;}
        public DbSet<Like> Likers {get;set;}
        public DbSet<User> Likees {get;set;}

        public DbSet<Message> Messages {get;set;}

        //change model creation behavior for many to many relationships likers users - likees users
        //because by convention entityframework will not know what is LikerId and LikeeId  
        //create a migration for this dotnet ef migrations add AddedLikeEntity && dotnet database update
        protected override void OnModelCreating(ModelBuilder builder) {
            //combination of fields for primary key because users cannot like more than one time another user
            builder.Entity<Like>()
                .HasKey(k =>  new { k.LikerId, k.LikeeId });

            //use fluent api to tell ef about relationship: one likee has many likers 
            builder.Entity<Like>().HasOne(u=> u.Likee).WithMany(u=> u.Likers)
                .HasForeignKey(u => u.LikeeId)//fk to go back to users table
                .OnDelete(DeleteBehavior.Restrict);//we do not want cascade delete and delete a user when relation is deleted

            //use fluent api to tell ef about relationship: one liker has many likees 
            builder.Entity<Like>().HasOne(u=> u.Liker).WithMany(u=> u.Likees)
                .HasForeignKey(u => u.LikerId)//fk to go back to users table
                .OnDelete(DeleteBehavior.Restrict);//we do not want cascade delete and delete a user when relation is deleted
        
        
            //configure messages for ef
        
            //use fluet api to tell ef about relationship: one likee has many likers 
            builder.Entity<Message>().HasOne(u=> u.Sender)
                .WithMany(m => m.MessagesSent)
                .OnDelete(DeleteBehavior.Restrict);//we do not want cascade delete and delete a user when relation is deleted

            //use fluent api to tell ef about relationship: one liker has many likees 
            builder.Entity<Message>()
                .HasOne(u=> u.Recipient)
                .WithMany(u=> u.MessagesReceived)
                .OnDelete(DeleteBehavior.Restrict);//we do not want cascade delete and delete a user when relation is deleted
            
        }

    }
}