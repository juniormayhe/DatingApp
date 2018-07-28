namespace DatingApp.API.Helpers
{
    public class UserParams
    {
        private const int MAX_PAGE_SIZE = 50;
        public int PageNumber { get; set; } = 1;
        
        //this default will not prevent cliente from asking more than 10 records
        private int pageSize = 10;
        public int PageSize
        {
            get { return pageSize;}
            //prevent user from asking more than 50 records
            set { pageSize = (value > MAX_PAGE_SIZE) ? MAX_PAGE_SIZE : value;}
        }

        public int UserId { get; set; }
        public string Gender {get; set;}

        public int MinAge {get;set;} = 18;
        public int MaxAge { get; set; } = 99;
        
        public string OrderBy { get; set; }
        public bool Likers {get;set;} = false;
        public bool Likees {get;set;} = false;
        
    }
}