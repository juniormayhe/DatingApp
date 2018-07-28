// on the course this is named Pagination. on course this is a interface
export class PaginationHeader {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
}

export class PaginatedResult<T> {
    result: T;
    // this is Pagination
    paginationHeader: PaginationHeader;
}
