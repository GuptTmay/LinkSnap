## Todos
1. Frontend Issues 
  1. QrCodeDetailsPage.tsx looks good. copy its style to LinksDetailsPage.tsx **Done**
  2. LinkEditPage.tsx and QrCodeEditPage.tsx need a ui rewamp. **Done**  
  3. When clicking on LinkCard or QrCodeCard in ListPages no loading page renders. **Done**
  4. Ask claude for optimizing Analytics Component. [here](https://claude.ai/chat/6b0acb1e-62b6-44bb-8f74-6b3b9cc8af02) **Done**

2. Add Rate Limiting by IP. **Done**
  - Add redis.
  - Set 10/request/mins/IP 

3. Optimize Redirection endpoint.  
  - Use Redis. **Done**
  - handle Analytics task somehow. **Done**

4. Benchmark every new architechural decision starting from baseline during optimization. **Done**
6. Setup Docs(README.md file). 
7. Reserved link codes such as health 
8. Project Ends.  

## Issues
 - Unmount the login button in login page.  
 - Blacklist jwt in backend when use logout using redis.  


## Could do in future 
- Add Mutex to redirect endpoint. 
  - Document and benchmark its effectiveness before and after.
  - Test it when a cached link expires and all the request fall back to postgresdb.
  - Check implementation here 4nd prompt: [here](https://claude.ai/share/ab6d6b5b-fe42-40d4-bc76-35b393fb4e6a)


