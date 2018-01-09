# backend-capstone

## About

This repo provides a server and database to support a front-end application for mental health support.

[Heroku Deployment](https://mental-healthy-backend.herokuapp.com/)

**************

## Endpoints

### Users

#### GET `users`

##### Description

Returns all users in an object as an array of `users`.

##### Parameters

| parameters | data type | description |
|------------|-----------|-------------|
| id         | integer   | unique id of user            |
| user_challenge       | string    | user's mental health challenge            | 
  
##### Request
  
```
GET /api/v1/users
```
  
##### Return
  
```

{
    "users": [
        {
            "id": 105,
            "user_name": "Jentastic",
            "user_image": null,
            "user_about": "I'm looking to find new ways to cope with my issues.",
            "user_location": "Denver",
            "user_email": "jen@email.com",
            "user_challenges": [
                "Anxiety",
                "Depression"
            ]
        },
        {
            "id": 106,
            "user_name": "Dan",
            "user_image": null,
            "user_about": "i'm sad.",
            "user_location": "Denver",
            "user_email": "dan@email.com",
            "user_challenges": [
                "Anxiety",
                "Bipolar",
                "Claustrophobia"
            ]
        },
  ...
}
```

##### Errors

If no users are found, a 404 error is returned. If a `user_challenge` that does not exist in the challenges table is sent as a parameter, a 500 error is returned.

*************************

#### GET `users`: /api/v1/users/:id

##### Description

Returns single user in an object as an array of `users`.

##### Request
  
```
GET /api/v1/users/105
```
  
##### Return
  
```

{
    "users": [
        {
            "id": 105,
            "user_name": "Jentastic",
            "user_image": null,
            "user_about": "I'm looking to find new ways to cope with my issues.",
            "user_location": "Denver",
            "user_email": "jen@email.com",
            "user_challenges": [
                "Anxiety",
                "Depression"
            ]
        }
    ]
}
```

##### Errors

If no users are found, a 404 error is returned. 

*************************

#### POST `users`: /api/v1/users

##### Description

Adds a new user to the `users` table and adds any challenges to the `user_challenges` table. The new user's id is returned.

##### Request
  
```
POST /api/v1/users
```

###### Body

The "user_name" property is required. Other properties are optional.

```
{
	"user_name": "Jen",
  "user_about": "I'm looking to find new ways to cope with my issues.",
  "user_location": "Denver",
  "user_email": "jen@email.com",
	"user_challenges": ["Depression"]
	
}

```

##### Return
  
```
{
    "id": 108
}
```

##### Errors

If the user_name property is omitted, a 422 error is returned.

*************************
