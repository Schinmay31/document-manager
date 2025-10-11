export interface IAuth {
  path: RegExp;
  method: "POST" | "GET" | "PUT" | "PATCH" | "DELETE" ;
}
