---
layout: post
title: Wrapping REST with Alamofire
---

Since the transition from [AFNetworking](https://github.com/AFNetworking/AFNetworking) to its Swift counterpart [Alamofire](https://github.com/Alamofire/Alamofire) was rather simple, I thought it would be cool to show some basic `GET`/`POST` functions while also exemplifying the wrapping of an undocumented REST API using the pretty library. And that undocumented API being my favorite, the [Tinder](https://gotinder.com) API.

The [Tinder API](https://api.gotinder.com) routes are described as follows:

```
[POST] /auth [facebook_id] [facebook_token]

This will return your Tinder xAuth token

[GET] /updates [X-Auth-Token]

This will return 15 'updates' or 'recommendations' (user profiles)

```
Documentation courtesy of [@rtt](https://github.com/rtt).

### Obtaining a Facebook Token
Obtaining a Facebook token is a bit annoying. I had tried authenticating through the `FBSDKLoginKit` library, but the user identifier and token it was returning didn't seem to work when passed into the `/auth` parameters. Following unofficial documentation by [@rtt](https://github.com/rtt) on GitHub, it does seem to work when the value of the `access_token` query in this [URL](https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token) is extracted. You go to that link, login to Facebook, then quickly copy the site address and extract the `access_token`. For the user ID, just use your own Facebook ID for testing purposes. Once you have those values, we can then pass them into the `facebook_id` and `facebook_token` parameters.

### Obtaining a Tinder xAuth Token
Now is when the fun starts. Using Alamofire, we could consider a method looking something like this:

```
private let TINDER_AUTH_URL = "https://api.gotinder.com/auth"

func authenticate(facebookToken: String, facebookUserId: String, completion: (success: Bool, String?) -> ()) {
        let paremeters = [
            "facebook_token" : facebookToken,
            "facebook_id"    : facebookUserId
        ]
        
        Alamofire.request(.POST, TINDER_AUTH_URL, parameters: paremeters).responseJSON { (response) in
            if response.response?.statusCode == 401 {
                completion(success: false, nil)
            } else {
                if let JSON = response.result.value {
                    if let token = JSON["token"]  {
                        completion(success: true, token)
                    }
                }
            }
        }
    }
```

Given that our authentication was successful, we will then be rewarded with a Tinder xAuth token. And with that...infinite matches! I'm kidding. I wish. Instead, we get to plug it in and have access to some data courtesy of Tinder. Let's try it out when querying for some recommendations.

### Fetching Profiles

```
private let TINDER_GET_USERS_URL = "https://api.gotinder.com/user/recs"

func getRecommendations(completion: (success: Bool, profiles: [STProfile]?) -> ()) {
        if let token = token {
            let headers = ["X-Auth-Token" : token]
            
            Alamofire.request(.GET, TINDER_GET_USERS_URL, headers: headers).responseJSON { (response) in
                if response.response?.statusCode == 401 {
                    completion(success: false, profiles: nil)
                } else {
                    if let JSON = response.result.value {
                        var profiles: [STProfile] = []
                        
                        for profile in JSON["results"] as! [NSDictionary] {
                            profiles.append(STProfile.init(dictionary: profile))
                        }
                        
                        completion(success: true, profiles: profiles)
                    }
                }
            }
            
        } else {
            completion(success: false, profiles: nil)
        }
    }
```

So as you can see, I make a `GET` request to the API endpoint, then parse each `NSDictionary` coming back as a custom object I called `STProfile`. To get an idea of what's being stored in the profile class, here's an idea:

```
class STProfile {
    
    enum STGenderType: Int {
        case STGenderTypeMale = 0
        case STGenderTypeFemale = 1
    }
    
    struct STInterest {
        var id: String
        var name: String
    }
    
    struct STPhoto {
        enum STPhotoSize: Int {
            case STPhotoSize640 = 0
            case STPhotoSize320 = 1
            case STPhotoSize172 = 2
            case STPhotoSize84 = 3
        }
        
        var photoURL: String?
        
        func photoWithSize(size: STPhotoSize) -> STPhoto {
            return STPhoto.init(photoURL: nil)
        }
    }
    
    var id: String
    var name: String
    var birthdate: String
    var bio: String

    var gender: STGenderType
    var photos: [STPhoto] = []
    
    init(dictionary: NSDictionary) {
        self.id = dictionary["_id"] as! String
        self.name = dictionary["name"] as! String
        self.birthdate = dictionary["birth_date"] as! String
        self.bio = dictionary["bio"] as! String
        self.gender = STGenderType(rawValue: dictionary["gender"] as! Int)!
        
        for photo in dictionary["photos"] as! [NSDictionary] {
            let photoURL = photo["url"] as! String
            let photoObject = STPhoto.init(photoURL: photoURL)
            
            photos.append(photoObject)
        }
    }
}
```

In our `init`, we parse each value from its key in the JSON dictionary to a local variable making up our model. 

Now, in order to use our functions, we could implement them like so:

```
let tinder = SwiftyTinder.sharedInstance
        
        tinder.authenticate(FB_TOKEN, facebookUserId: FB_ID) { (success, token) in
            if success {
                tinder.getRecommendations { (success, profiles) in
                    if success {
                        print(profiles)
                    }
                }
            } else {
                print("Error getting token")
            }
        }
```

With what we have now, we'd be able to achieve something like this:

Table            			  |  Detail
:-------------------------:|:-------------------------:
![]({{ site.url }}/assets/img/flatiron/tinder-api/tinderbook.png)  |  ![]({{ site.url }}/assets/img/flatiron/tinder-api/tinderbook-detail.png)

This code is open-sourced and will soon be a fully-functional API wrapper. You can find and contribute to it [here](https://github.com/imryan/swifty-tinder).

