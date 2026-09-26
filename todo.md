## Todos
1. Frontend Issues 
  1. QrCodeDetailsPage.tsx looks good. copy its style to LinksDetailsPage.tsx **Done**
  2. LinkEditPage.tsx and QrCodeEditPage.tsx need a ui rewamp. **Done**  
  3. When clicking on LinkCard or QrCodeCard in ListPages no loading page renders. **Done**
  4. Ask claude for optimizing Analytics Component. [here](https://claude.ai/chat/6b0acb1e-62b6-44bb-8f74-6b3b9cc8af02) **Done**

2. Add Rate Limiting by IP. **Done**
  - Add redis.
  - Set 10/request/mins/IP 
3. Measure Redirect endpoint latency before optimization.  
4. Optimize Redirection endpoint.  
  - Use Redis. 
  - handle Analytics task somehow.
5. Measure Redirect endpoint latency after optimization.  
6. Setup Docs(README.md file). 
7. Reserved link codes such as health 
7. Project Ends.  

## Future Todo

1. Feat: Integration Test for Analytics Repo
2. Refactor: Optimize RedirectByLongUrl func in Link Controller.
3. Feat: Add last access time to tags. So we can give user the most recently used tags.
4. Fix: In Analytics if geolocationbyip is not able to find user location set it as unknow
   Or May this already works as it is set to null which can be take as unknow.
   But check it before deciding
5. Fix: logout not working,
   when user logout blacklist their jwt.
   delete token from cookie on the frontend.
