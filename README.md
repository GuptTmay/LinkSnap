# SnapUrl (Project Name)
	Url Shortener service. 
	
# Feature
 - Shortener Urls
 - Redirect users. 
 - Allow custom urls
 - User Sign up/ in (Add Oauth)
 - Analytics 

# Functional Feature
- URL Shorten
- Firebase Auth 
- Custom link Id





### Current Todo
- User Generate Qr Code
	- After generating link.
	- Direct Qr Code Generation. 
	- Ideally i want to complete this in a single request.  

	- sol
		- endpoint: \gen_qrcode
			- {linkId: null/string, linkData: { longUrl: string }/null, qrData: {customization: json}}

	- Understanding what will happen in both cases. 
	- After Generating link user generate qr code. 
		- POST {linkId: string, linkData: null, qrData: {customization: json}}
		- User new qr code is generated.  	
	- Before Generating Link	
		- POST {linkId: null, linkData: {longUrl: string}, qrData: {customization: json}}
		- user qr code is generated. 	
	
	ok so this is not very restfull so we are going to create a seperate endpoint for this. 

	- New endpoint: 
		- POST: \links\:id\qrcode -> Create new qr code under the already generated link
		- body: {customization: json}

	- New endpoint:
		- POST /links/:linkId/qrcode → Create a QR code for an existing link
		- body: { customization?: { color?, backgroundColor?, size?, logoUrl? } }
		- 404 if linkId doesn't exist or doesn't belong to the authenticated user
		- 409 if a QR code already exists for this link (use PATCH /links/:linkId/qrcode to update instead)

		Done


### old Todos
- Frontend
	- Allow user to add their link and get shortened url 	
- Backend
	- patch update/edit link details  
- other
	- use jwt with cookies


















## Todos
### Sunday
	- Add seperate branch(develop) for the project
	- Add Firebase Auth
	- Complete the basic UI for the app (urlshortner feature, login, signup)
	- custom link id
	- Basic analytics (clicks, country, device, browser)

### Future Todos
	- Add Oauth (Google, Facebook, Twitter)
	- QR code generation for the shortened urls
	- Add Redis
	- rate limiting by IP address
	- Write unit tests for the project Using Playwright 
	- Test service performance before and after adding optimizations like (redis, etc) 
	- Implement a better analytics dashboard for the users to view their link analytics.
	- User upload images and videos to the service and generate a short link for them.





