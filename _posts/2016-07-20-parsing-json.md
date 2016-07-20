---
layout: post
title: Parsing JSON with AFNetworking
---

Say you want to make your app come alive with refreshed data from the web. There are a number of options you have already, such as `JSON`, `XML`, `HTML` scraping, etc. The easiest of them all (in my opinion) is `JSON`, which is JavaScript Object Notation. A basic `JSON` object from an API for a Product would look something like this:

```
{
    "id": 1,
    "name": "A green door",
    "price": 12.50,
    "tags": ["home", "green"]
}
```

Accessing the data within the JSON object is easy, as there are many open source libraries available to assist in streamlining your development process. For this post, I'll be using [AFNetworking](https://github.com/AFNetworking/AFNetworking), my favorite Objective-C networking framework. You can also find the Swift alternative, [Alamofire](https://github.com/Alamofire/Alamofire).

We're going to be using another open source repository, [MTA-API](https://github.com/mimouncadosch/MTA-API), which is a RESTful wrapper of a [GTFS](https://developers.google.com/transit/gtfs/) feed for the New York City Transit. The service contains a number of routes, so let's lay them out in order to plan our approach.

```
[GET] /stations
Returns list of station objects containing the stop ID and stop name.

[GET] /stop?id=[stopId]
Returns the name and coordinates of the station with the given stop ID.

[GET] /api?id=[stopId]
Returns the name and coordinates of the station with the given stop ID as well as an array of it's latest arrival times.

[GET] /times?hour=[hour]&minute=[minute]
Returns all stations where a train arrives at the given time. (24h time)
```

Now that we have our routes laid out, we can choose which ones we'd like to hit and retrieve. For this post, we'll be using the last listed route, which will retrieve a list of stations arriving at the current or passed in time value.

First, let's build the model that almost mocks the JSON object we will be receiving.

```
{
	"arrival": "10:25:00",
	"id": "L28N",
	"lat": "40.650573",
	"lon": "-73.899485",
	"name": "E 105 St"
}
```

Would look something like this in our code

```
@interface Station : NSObject

@property (nonatomic, readonly) NSString *stopId;
@property (nonatomic, readonly) NSString *name;
@property (nonatomic, readonly) NSString *arrival;
@property (nonatomic, readonly) CGPoint location;

- (instancetype)initWithStopId:(NSString *)stopId
                          name:(NSString *)name
                       arrival:(NSString *)arrival
                      location:(CGPoint)location;

@end
```

And in our implementation:

```
@interface Station ()

@property (nonatomic, strong) NSString *stopId;
@property (nonatomic, strong) NSString *name;
@property (nonatomic, strong) NSString *arrival;
@property (nonatomic, assign) CGPoint location;

@end

@implementation Station

- (instancetype)initWithStopId:(NSString *)stopId
                          name:(NSString *)name
                       arrival:(NSString *)arrival
                      location:(CGPoint)location {
    
    self = [super init];
    
    if (self) {
        self.stopId = stopId;
        self.name = name;
        self.arrival = arrival;
        self.location = location;
    }
    
    return self;
}

@end
```

Think about this in the simplest way possible. We want to pull our JSON object and convert it to our own native object in our code. To retrieve the objects, it gets a little more complex but a lot more efficient with blocks. Consider this line:

```
typedef void (^StationResult)(NSArray *stations, NSError *error);
```

This will be a parameter in our method call to retrieve and parse the JSON objects. This is a callback block that will safely return the array of stations and/or an error message back to the class that is calling it. Let's write out our method signature:

```
+ (void)getStationsArrivingAt:(NSString *)hour minute:(NSString *)minute block:(StationResult)block;
```

We make this a class method of our `Station` class because we will be returning instances of the class, so we don't want to alloc a useless instance if we don't necessarily have to. Also, before we write our method's implementation, it's good practice to create a constant value to hold our URL/API endpoint. Place this at the top of your `.m` file like so:

```
static NSString * const kStationArrivalsURL = @"https://mtaapi.herokuapp.com/times?hour=%@&minute=%@";
```
We use the `%@` string format specifier as a placeholder since we'll be replacing them with our own values soon. Next, we write out our method body like so, using AFNetworking's easy to use request functions.

```
+ (void)getStationsArrivingAt:(NSString *)hour minute:(NSString *)minute block:(StationResult)block {
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    
    NSString *url = [NSString stringWithFormat:kStationArrivalsURL, hour, minute];
    
    [manager GET:url parameters:nil progress:nil success:^(NSURLSessionTask *task, id responseObject) {
        
        NSMutableArray *stations = [NSMutableArray array];
        NSMutableArray *names = [NSMutableArray array];
        
        for (id object in responseObject[@"result"]) {
            if (![names containsObject:object[@"name"]]) {
                
                CGFloat latitude = [object[@"lat"] floatValue];
                CGFloat longitude = [object[@"lon"] floatValue];
                CGPoint location = CGPointMake(latitude, longitude);
                
                Station *station = [[Station alloc] initWithStopId:object[@"id"]
                                                              name:object[@"name"]
                                                           arrival:object[@"arrival"]
                                                          location:location];
                
                [stations addObject:station];
                [names addObject:station.name];
            }
        }
        
        block(stations, nil);
        
    } failure:^(NSURLSessionTask *operation, NSError *error) {
        block(nil, error);
    }];
}
```

So first we parse our URL string by replacing the format specifiers with our requested values, then we instantiate two `NSMutableArray`s, one to hold our stations to be returned, and the other to log each station name to check for duplicates. We iterate through the `responseObject`, which is the JSON content. Each object is contained in an array called `result`, hence why we iterate through `responseObject[@"result"]`. We create a new unique `Station` object from the JSON object and finally add our values into the arrays. Once the loop has finished, we pass back our array using `block`, which expanded reads `(NSArray *stations, NSError *error)`. We pass `nil` into our error parameter since there are no errors. BUT, in the case there was an error, the `failure:` parameter would be called, in which case we'd pass the given `error` object into our block's parameter.

And now, the glory...using our custom method in our own classes!

```
[Station getStationsArrivingAt:@"10" minute:@"00" block:^(NSArray *stations, NSError *error) {
        if (!error) {
            for (Station *station in stations) {
                NSLog(@"%@ : %@", station.name, NSStringFromCGPoint(station.location));
            }
        } else {
            NSLog(@"Error: %@", error.localizedDescription);
        }
    }];
```

And voila, we have a complete and unique array of our `Station` objects with each property filled and accessible. Try it out! Also, the method signature could be altered to take in an `NSDate` object that's formatted through an `NSDateFormatter` for prettiness. I used `NSString` arguments for simplicity in this case.

Here's an example project I've built using this API wrapper:
![]({{ site.url }}/assets/img/flatiron/parsing-json/example.jpg)
