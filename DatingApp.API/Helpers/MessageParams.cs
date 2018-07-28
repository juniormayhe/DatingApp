namespace DatingApp.API.Helpers
{
    public class MessageParams
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
        public string MessageContainer {get; set;} = "Unread";
        
    }
}