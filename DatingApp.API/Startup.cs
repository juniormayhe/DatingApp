using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var key = Encoding.ASCII.GetBytes(Configuration["AppSettings:Token"]);

            //datacontext must be injected in other parts of this app.
            //depends on  <PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="2.1.0"/>
            services.AddDbContext<DataContext>(x => x.UseSqlite(Configuration.GetConnectionString("DefaultConnection")));
            services.AddTransient<Seed>();
            //if you want an action filter to be executed globally, you can change options in AddMVc
			services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                    //AddJsonOptions to avoid Newtonsoft.Json.JsonSerializationException: Self referencing loop detected for property 'user' with type 'DatingApp.API.Models.User'. Path '[0].photos[0]'.
                    .AddJsonOptions(options=> options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);            
			services.AddCors();
            services.Configure<CloudinarySettings>(Configuration.GetSection("CloudinarySettings"));
            services.AddAutoMapper();
            //here we can swap to another repository or include if clauses for different environments
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IDatingRepository, DatingRepository>();
            services.AddScoped<LogUserActivity>();
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options=> options.TokenValidationParameters = new TokenValidationParameters{
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, Seed seeder)
        {
            //order here matters, so useMVC must be the last command to provide the response from server
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(builder=>builder.Run(async context=>{
                    //here I have access to http context
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    var error = context.Features.Get<IExceptionHandlerFeature>();
                    if (error != null) {
                        // add Application-Error header
                        context.Response.AddApplicationError(error.Error.Message);
                        // write error message to content response
                        await context.Response.WriteAsync(error.Error.Message);
                    }
                }));
                app.UseHsts();
            }
			

            // load new users, uncomment this if you want to reseed database
            //seeder.SeedUsers();

			app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().AllowCredentials());

            // allow a specific origin
            /*
			app.UseCors(builder => builder
                        .AllowCredentials()
                        .WithOrigins("https://localhost:4200")
                        .AllowAnyMethod()
                        .WithHeaders("authorization", "accept", "content-type", "origin")); //allow bearer authorization
            */          
            
            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
