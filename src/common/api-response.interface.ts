export interface PaginationMeta {page:number;limit:number;total:number;totalPages:number;hasNextPage:boolean;hasPreviousPage:boolean}
export interface ApiResponse<T>{success:boolean;message:string;data:T;pagination?:PaginationMeta}
export const pageMeta=(page:number,limit:number,total:number):PaginationMeta=>({page,limit,total,totalPages:Math.ceil(total/limit),hasNextPage:page*limit<total,hasPreviousPage:page>1});
