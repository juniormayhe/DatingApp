using System;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DatingApp.API.Helpers
{
    public static class Extensions
    {
        public static void AddApplicationError(this HttpResponse response, string message) {
            
            response.Headers.Add("Application-Error", message);
            
            // in order to make the Application-Error header available to our browser
            response.Headers.Add("Access-Control-Expose-Headers", "Application-Error");
            
            // any origin is allowed to access this specific Application-Error header
            response.Headers.Add("Access-Control-Allow-Origin", "*");
        }
        public static void AddPagination(this HttpResponse response, int currentPage, int itemsPerPage, int totalItems, int totalPages) {
            var paginationHeader = new PaginationHeader(currentPage, itemsPerPage, totalItems, totalPages);
            
            var camelCaseFormatting = new JsonSerializerSettings();
            camelCaseFormatting.ContractResolver = new CamelCasePropertyNamesContractResolver();
            //with second parameter force PascalCase to be camelCase
            response.Headers.Add("Pagination", JsonConvert.SerializeObject(paginationHeader, camelCaseFormatting));
            
            // make Pagination custom header available in browsers
            response.Headers.Add("Access-Control-Expose-Headers", "Pagination");
        }
        
        public static int CalculateAge(this DateTime dateOfBirth){
            var age = DateTime.Today.Year - dateOfBirth.Year;
            if (dateOfBirth.AddYears(age) > DateTime.Today){
                age --;
            }  
            return age;
        } 
    }
    
}