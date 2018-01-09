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

##### Query Parameters

| parameters | data type | description |
|------------|-----------|-------------|
| id         | integer   | unique id of user            |
| user_challenge       | string    | user's mental health challenge            | 
  
##### Request
  
```
GET /api/v1/users
GET /api/v1/users?user_challenge=OCD
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

If no user is found, a 404 error is returned. 

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
If a `user_challenge` that does not exist in the challenges table is sent in the body, a 500 error is returned.

*************************

#### PATCH `users`: /api/v1/users/:userID

##### Description

Update a user in the `users` table and any associated user_challenges in the `user_challenges` table. The new user is returned.

##### Request
  
```
PATCH /api/v1/users/:userID
```

###### Body

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
    "user": {
        "id": 106,
        "user_name": "Jen",
        "user_image": null,
        "user_about": "I'm looking to find new ways to cope with my issues.",
        "user_location": "Denver",
        "user_email": "nevin.jennifer@gmail.com",
        "user_challenges": [
            "Depression"
        ]
    }
}
```

##### Errors

If the user to be updated cannot be found, a 404 error is returned.

*************************





### Professionals

#### GET `professionals`

##### Description

Returns all professionals in an object as an array of `professionals`.

##### Query Parameters

| parameters | data type | description |
|------------|-----------|-------------|
| id         | integer   | unique id of user            |
| specialty       | string    | professional's specialty            | 
| insurance_provider       | string    | insurance accepted by professional            | 
  
##### Request
  
```
GET /api/v1/professionals
GET /api/v1/professionals?specialty=LGBTQ
GET /api/v1/professionals?insurance_provider=BCBS
```
  
##### Return
  
```

{
    "professionals": [
        {
            "id": 78,
            "professional_name": "Dr. Smith",
            "professional_image": null,
            "professional_location": "Denver",
            "professional_email": "smith@email.com",
            "professional_phone": "555-555-1234",
            "professional_insurance_providers": [
                "Aetna"
            ],
            "professional_specialties": [
                "Addiction"
            ]
        },
        {
            "id": 79,
            "professional_name": "Dr. Johnson",
            "professional_image": null,
            "professional_location": "Denver",
            "professional_email": "johnson@email.com",
            "professional_phone": "555-555-1111",
            "professional_insurance_providers": [
                "Kaiser",
                "Humana"
            ],
            "professional_specialties": [
                "Families",
                "Careers"
            ]
        },
  ...
}
```

##### Errors

If no professionals are found, a 404 error is returned. If a `specialty` or `insurance_provider` that does not exist in the specialties/insurance_providers tables is sent as a parameter, a 500 error is returned.

*************************

#### GET `professionals`: GET /api/v1/professionals/:professionalID

##### Description

Returns single professional in an object with key `professional`.

##### Request
  
```
GET /api/v1/professionals/78
```
  
##### Return
  
```

{
    "professional": {
        "professional_insurance_providers": [
            "Aetna"
        ],
        "professional_specialties": [
            "Addiction"
        ],
        "id": 78,
        "professional_name": "Dr. Smith",
        "professional_image": null,
        "professional_location": "Denver",
        "professional_email": null,
        "professional_phone": "555-555-1234"
    }
}
```

##### Errors

If no professional is found, a 404 error is returned. 

*************************

#### POST `professionals`: /api/v1/professionals

##### Description

Adds a new professional to the `professionals` table and adds any specialtys to the `professional_specialties` table and insurance providers to the `insurance_providers` table. The new professional's id is returned.

##### Request
  
```
POST /api/v1/professionals
```

###### Body

The "professional_name" and "professional_location" properties are required. Other properties are optional.

```
{
	"professional_name": "Dr. Dan",
	"professional_location": "Denver",
	"professional_email": "dan@email.com",
	"professional_phone":	"555-555-5555",
	"professional_insurance_providers": ["Aetna", "BCBS"],
	"professional_specialties": ["Couples"]
}

```

##### Return
  
```
{
    "id": [
        90
    ]
}
```

##### Errors

If the professional_name or professional_location property is omitted, a 422 error is returned.
If a `specialty` or `insurance_provider` that does not exist in the specialties/insurance_providers tables is sent in the body, a 500 error is returned.

*************************
### Insurance Providers

#### GET `insuranceProviders`

##### Description

Returns all insurance providers in an object as an array of `insuranceProviders`.

##### Request
  
```
GET /api/v1/insuranceProviders
```
  
##### Return
  
```

{
    "insuranceProviders": [
        {
            "id": 41,
            "insurance_provider_name": "Aetna",
            "created_at": "2018-01-08T23:45:00.471Z",
            "updated_at": "2018-01-08T23:45:00.471Z"
        },
        {
            "id": 42,
            "insurance_provider_name": "BCBS",
            "created_at": "2018-01-08T23:45:00.471Z",
            "updated_at": "2018-01-08T23:45:00.471Z"
        },
  ...
}
```

*************************

#### GET `insuranceProviders`: GET /api/v1/insuranceProviders/:insuranceProviderID

##### Description

Returns single insurance provider in an object with key `insuranceProvider`.

##### Request
  
```
GET /api/v1/insuranceProviders/41
```
  
##### Return
  
```
{
    "insuranceProvider": {
        "id": 41,
        "insurance_provider_name": "Aetna",
        "created_at": "2018-01-08T23:45:00.471Z",
        "updated_at": "2018-01-08T23:45:00.471Z"
    }
}
```

##### Errors

If no insurance provider is found, a 404 error is returned.

*************************

#### POST `insuranceProviders`: /api/v1/insuranceProviders

##### Description

Adds a new insurance provider to the `insurance_providers` table. The new insurance provider's id is returned.

##### Request
  
```
POST /api/v1/insuranceProviders
```

###### Body

The "insurance_provider_name" property is required.

```
{
	"insurance_provider_name": "Humana"
	
}

```

##### Return
  
```
{
    "id": [
        51
    ]
}
```

##### Errors

If the insurance_provider_name property is omitted, a 422 error is returned.

*************************

### Specialties

#### GET `specialties`

##### Description

Returns all specialties in an object as an array of `specialties`.

##### Request
  
```
GET /api/v1/specialties
```
  
##### Return
  
```
{
    "specialties": [
        {
            "id": 41,
            "specialty_name": "Addiction",
            "created_at": "2018-01-08T23:45:00.473Z",
            "updated_at": "2018-01-08T23:45:00.473Z"
        },
        {
            "id": 42,
            "specialty_name": "Careers",
            "created_at": "2018-01-08T23:45:00.473Z",
            "updated_at": "2018-01-08T23:45:00.473Z"
        },
  ...
}
```

*************************

#### GET `specialties`: GET /api/v1/specialties/:specialtyID

##### Description

Returns single specialty in an object with key `specialty`.

##### Request
  
```
GET /api/v1/specialties/41
```
  
##### Return
  
```
{
    "specialty": {
        "id": 41,
        "specialty_name": "Addiction",
        "created_at": "2018-01-08T23:45:00.473Z",
        "updated_at": "2018-01-08T23:45:00.473Z"
    }
}
```

##### Errors

If no specialty is found, a 404 error is returned.

*************************

#### POST `specialties`: /api/v1/specialties

##### Description

Adds a new specialty to the `specialties` table. The new specialty's id is returned.

##### Request
  
```
POST /api/v1/specialties
```

###### Body

The "specialty_name" property is required.

```
{
	"specialty_name": "PTSD"
	
}

```

##### Return
  
```
{
    "id": [
        51
    ]
}
```

##### Errors

If the specialty_name property is omitted, a 422 error is returned.

*************************

### Challenges

#### GET `challenges`

##### Description

Returns all challenges in an object as an array of `challenges`.

##### Request
  
```
GET /api/v1/challenges
```
  
##### Return
  
```
{
    "challenges": [
        {
            "id": 41,
            "challenge_name": "Agoraphobia",
            "created_at": "2018-01-08T23:45:00.467Z",
            "updated_at": "2018-01-08T23:45:00.467Z"
        },
        {
            "id": 42,
            "challenge_name": "Anorexia",
            "created_at": "2018-01-08T23:45:00.467Z",
            "updated_at": "2018-01-08T23:45:00.467Z"
        },
  ...
}
```

*************************

#### GET `challenges`: GET /api/v1/challenges/:challengeID

##### Description

Returns single challenge in an object with key `challenge`.

##### Request
  
```
GET /api/v1/challenges/41
```
  
##### Return
  
```
{
    "challenge": {
        "id": 41,
        "challenge_name": "Agoraphobia",
        "created_at": "2018-01-08T23:45:00.467Z",
        "updated_at": "2018-01-08T23:45:00.467Z"
    }
}
```

##### Errors

If no challenge is found, a 404 error is returned.

*************************

#### POST `challenges`: /api/v1/challenges

##### Description

Adds a new challenge to the `challenges` table. The new challenge's id is returned.

##### Request
  
```
POST /api/v1/challenges
```

###### Body

The "challenge_name" property is required.

```
{
	"challenge_name": "ADHD"
	
}

```

##### Return
  
```
{
    "id": [
        51
    ]
}
```

##### Errors

If the challenge_name property is omitted, a 422 error is returned.

*************************

### Favorite Users

#### GET `favoriteUsers`

##### Description

Returns all favorite users for a user based on the user's id.

##### Request
  
```
GET /api/v1/favoriteUsers/105
```
  
##### Return
  
```
{
    "favoriteUsers": [
        {
            "id": 107,
            "user_name": "Holly",
            "user_image": null,
            "user_about": "Hey, I'm Holly.",
            "user_location": "Denver",
            "user_email": "holly@gmail.com",
            "user_challenges": ["OCD", "Anxiety"]
        },
	{
            "id": 120,
            "user_name": "Lily",
            "user_image": null,
            "user_about": "Help!",
            "user_location": "Denver",
            "user_email": "lily@gmail.com",
            "user_challenges": ["Depression"]
        },
  ...
}
```
##### Errors

If no users are found, a 404 error is returned.

*************************

#### POST `favoriteUsers`: /api/v1/favoriteUsers/:userID

##### Description

Adds a new favorite user to the `favorite_users` table. The id's of the user and the favorite user are returned.

##### Request
  
```
POST /api/v1/favoriteUsers/105
```

###### Body

The "favoriteUserID" property is required.

```
{
	"favoriteUserID": "108"
	
}

```

##### Return
  
```
{
    "favoriteUser": [
        {
            "user_id": 105,
            "favorite_user_id": 108,
            "created_at": "2018-01-09T18:17:49.901Z",
            "updated_at": "2018-01-09T18:17:49.901Z"
        }
    ]
}
```

##### Errors

If the favoriteUserID property is omitted, a 422 error is returned.

*************************

#### DELETE `favoriteUser`: DELETE /api/v1/favoriteUsers/:userID/:favoriteUserID

##### Description

Deletes a favorite user from the `favorite_users` table.

##### Request
  
```
DELETE /api/v1/favoriteUsers/105/108
```
  
##### Return
  
Status code 204.

##### Errors

If no favorite user is found, a 404 error is returned.

*************************

### Favorite Professionals

#### GET `favoriteProfessionals`

##### Description

Returns all favorite professionals for a user based on the user's id.

##### Request
  
```
GET /api/v1/favoriteProfessionals/105
```
  
##### Return
  
```
{
    "favoriteProfessionals": [
        {
            "id": 79,
            "professional_name": "Dr. Johnson",
            "professional_image": null,
            "professional_location": "Denver",
            "professional_email": "johnson@email.com",
            "professional_phone": "555-555-1111",
            "professional_insurance_providers": [
                "Humana",
                "Kaiser"
            ],
            "professional_specialties": [
                "Families",
                "Careers"
            ]
        },
	{
            "id": 95,
            "professional_name": "Dr. Williams",
            "professional_image": null,
            "professional_location": "Denver",
            "professional_email": "williams@email.com,
            "professional_phone": "555-555-1911",
            "professional_insurance_providers": [
                "Humana"
            ],
            "professional_specialties": [
                "Families",
                "Careers",
		"Veterans"
            ]
        },
  ...
}
```
##### Errors

If no professionals are found, a 404 error is returned.

*************************


#### POST `favoriteProfessionals`: /api/v1/favoriteProfessionals/:userID

##### Description

Adds a new favorite professional to the `favorite_professionals` table. The id's of the user and the favorite professional are returned.

##### Request
  
```
POST /api/v1/favoriteProfessionals/105
```

###### Body

The "favoriteProfessionalID" property is required.

```
{
	"favoriteProfessionalID": "108"
	
}

```

##### Return
  
```
{
    "favoriteProfessional": [
        {
            "user_id": 105,
            "favorite_professional_id": 79,
            "created_at": "2018-01-09T18:20:52.022Z",
            "updated_at": "2018-01-09T18:20:52.022Z"
        }
    ]
}
```

##### Errors

If the favoriteProfessionalID property is omitted, a 422 error is returned.

*************************

#### DELETE `favoriteProfessional`: DELETE /api/v1/favoriteProfessionals/:userID/:favoriteProfessionalID

##### Description

Deletes a favorite professional from the `favorite_professionals` table.

##### Request
  
```
DELETE /api/v1/favoriteProfessionals/105/79
```
  
##### Return
  
Status code 204.

##### Errors

If no favorite professional is found, a 404 error is returned.

*************************
