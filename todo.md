## Todos

- UPDATE create todo in backend to handle
  - Tags:
  - Title:
  - In controller, Repo
    **Done**

- ADD endpoint to check if a url backhalf exist
  - Backend
  - Frontend in links.api.ts
    **Done**

- ADD Get All user tags
  - Searchable
  - Backend:
  - Frontend in tags.api.ts
    **Done**

- ADD List links & qrcode pages
  - List Links.
  - List QrCodes.

  What we want to show the user for each link card on list links - title: If null then set the domain name of the url as the title, - shorturl, - tags, - created date. - Dist url - A logo of dist url.
  - delete button - edit button - take user to /links/{shortUrl}/edit make it dummy for now.

    use:
    - npx shadcn@latest add pagination for pagination.
    - getLinks() from links.api.ts
    - Use Sonner getLinks() would throw if ApiError from types/error.ts if any error happen.

    Task:
    Edit LinkListPage.tsx to show all user links.
    keep qrCode: false in getLinks payload.
    Make it look beauity full.

    **Done**

- REFACTOR Links and Qrcodes details page.
  - get link details.
  - get QrCode Details.
    **Done**

- ADD edit Links and qrcode pages.
  - patch links.
  - patch qrcode. -> patch links.
    **Done**

- REFACTOR: Overhaul Frontend
  - Make it look beautiful.
    **Done**

- FEAT: Deploy Project
  - Redirect url from base website url to main landing page.   
  - Handle user entering wrong addresses. 
  - in Both backend and frontend. 
  - Solve edge cases. 

- FEAT: Show Analytics in Details page.

- Measure Redirect Api latency at scale
  - Work towards optimizing it while measuring its impact.

- FEAT: Dynamic Routing.

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
