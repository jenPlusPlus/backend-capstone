# backend-capstone

## About

This repo provides a server and database to support a front-end application for mental health support.

[Heroku Deployment](https://jen-adam-byob.herokuapp.com/)

**************

## Endpoints

### Users

#### GET `users`: /api/v1/users

##### Description

Returns all users in an object as an array of `users`.

##### Parameters

| parameters | data type | description |
|------------|-----------|-------------|
| id         | integer   | unique id of user            |
| user_challenge       | string    | user's mental health challenge            | 
  
##### Request
  
```
GET users
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
            "user_email": "jenniferpwoodson@gmail.com",
            "user_challenges": [
                "Anxiety",
                "Depression"
            ]
        },
        {
            "id": 106,
            "user_name": "jenny",
            "user_image": null,
            "user_about": "i'm sad.",
            "user_location": "Denver",
            "user_email": "nevin.jennifer@gmail.com",
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

