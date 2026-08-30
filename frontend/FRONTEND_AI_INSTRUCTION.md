


LinksCreatePage: 
- edit /src/pages/LinksCreatePage.tsx 
- use createLink in /src/api/links.api.ts 
- this would be the schema of links body. 
{
  shortUrl: z.string().trim().min(1).max(20).regex(/^[a-zA-Z0-9_-]+$/, "Invalid short URL").optional(),
  longUrl: z.url(),
  title: z.string().trim().min(1).max(64).optional(),
  tags: z.array(z.string().trim().min(1).max(50).toLowerCase()).optional(),
}

instruction: you need to create a page which creates a links and redirect the user to the link page where all the information about that single created link exist. 
    The page should ask for: 
    - Destination URL as longUrl
    - Back-Half as shortUrl (optional) this would be the custom back-half of the url.
        - if user does not enter this then don't add back-half to createLink body. 
        - if user does enter it
            - use checkShortUrl func in /src/api/links.api.ts to know if the Back-Half already exist or not. it will return boolean
    - Title (optional) 
    - Tags: use https://ui.shadcn.com/docs/components/base/combobox#multiple 
            install it using `npx shadcn@latest add combobox`
            - This allow 2 things: 
                - Add old Tags 
                - Create new Tags 
             using a single component.
            - Add all new or old tags to the data of createLink as an array.
            - Also add debouncing. to input component. 
            - Use getTags func /src/api/tags.api.ts to get tags leave empty if you want to fetch all tags.    
     
    When user is done he can click on create link button which will invoke the createLink func.      
    Show response as per the request response using sonner toast. 
    if the reponse is a success then redirect user to the dedicated page meant for that single link. 
        - for now redirect user to dummy /links/{dummyShortId}/details 

QrCodesCreatePage: 
    This ask user. 
    - Long URL 
    - Tags
    - Title

    User would be
