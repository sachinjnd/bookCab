# bookCab
Remind you to book a cab

Responsive Frontend is developed using HTML, Bootstrap
Backend is developed using NodeJS (Express)
Data binding done using ReactJS


Steps to start using:
1. Enter API secrkeys and tokens in file backend/config.js
2. Start node server from backend directory
3. Put frontend directory in your localhost server's public directory
4. Open http://localhost/frontend in your browser
5. Since information is not stored in any database, do not close the browser window else all information will be lost


Assumptions:
1. Whatever the uber api and google maps api respond is true
2. The time to arrive at the destination is within today
3. Ignored the case when it’s already too late to book the uber
4. The maximum deviation of driving times at any time of the day is 60 mins
5. The maximum time for Uber to arrive at the source is 15 minutes
(4 and 5 can be changed from index.js or index.min.js file [whichever is being used in index.html] present in frontend/js directory)
6. Safe time interval can also be set in above files if API call times are to be taken into consideration


Some logic behind the scenes:
1. User inputs are checked and registered for reminder if correct
2. An API call is made to Google Maps API and max time to book & travel is calculated using the time reported by Maps API + 60 minutes (max travel deviation) + 15 minutes (max uber ETA)
3. If current time is outside the max time calculated above, an API call to Google Maps is scheduled after that interval. For example, if you schedule a cab reminder for after 10 hours and max travel time as calculated above is 2 hours, then the next API call is requested after 8 hours from now
4. Max possible travel time is updated after every Google Maps API call is made
5. When the current time reaches within the max possible time, API calls are scheduled for every minute to both Google Maps and Uber API
6. Send email call is made when it is the time to book an Uber
