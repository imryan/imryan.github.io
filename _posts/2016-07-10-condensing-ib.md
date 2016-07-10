---
layout: post
title: Writing D.R.Y. Code with IBOutletCollection
---

When working with multiple `IBOutlets` or `IBActions` that share similar attributes or events, I've noticed a common trend that looks something like this:

```
@property (nonatomic, weak) IBOutlet UIButton *tile1;
@property (nonatomic, weak) IBOutlet UIButton *tile2;
@property (nonatomic, weak) IBOutlet UIButton *tile3;
@property (nonatomic, weak) IBOutlet UIButton *tile4;

- (IBAction)selectedTile1:(id)sender;
- (IBAction)selectedTile2:(id)sender;
- (IBAction)selectedTile3:(id)sender;
- (IBAction)selectedTile4:(id)sender;
```

This tends to create a sense of redundancy and puts in the grave the idea of D.R.Y. (don't repeat yourself). You'll be able to call yourself out on this once you start seeing that variable names take on an incrementing value at the end. We could take the aforementioned chunk of outlet and action declarations and convert them into something like this:

```
@property (nonatomic, strong) IBOutletCollection(UIButton) NSArray *tiles;

- (IBAction)selectedTile:(UIButton *)sender;
```
For this example, we'll be building the start of a simplified version of the game [Simon.](http://bit.ly/29r8TMZ) Also, it may be important to note that I've changed the `sender` argument on our `IBAction` method to readily accept a `UIButton` parameter. This just makes things a bit easier since we know for a fact we'll be receiving a `UIButton` type, so there's no need for type `id`. In which case we'd have to cast that to a button before use of the button's attributes.

Next, we would then connect each tile button in our Storyboard just as we would any other outlet:

![]({{ site.url }}/assets/img/flatiron/collections/collection-outlets.png)

We can see that each tile is connected to our outlet collection.

![]({{ site.url }}/assets/img/flatiron/collections/tile-outlets.png)

And we'd do just the same for our actions:

![]({{ site.url }}/assets/img/flatiron/collections/actions.png)

So, all together our view should look something like this:

![]({{ site.url }}/assets/img/flatiron/collections/view.png)


Now it's time to make it work. First, let's write a helper method that can take in a `UIColor` parameter and return its name as a `NSString`.

```
- (NSString *)stringFromUIColor:(UIColor *)color {
    NSString *string = @"";
    
    if (CGColorEqualToColor(color.CGColor, [UIColor flatRedColor].CGColor)) {
        string = @"Red";
        
    } else if (CGColorEqualToColor(color.CGColor, [UIColor flatGreenColorDark].CGColor)) {
        string = @"Green";
        
    } else if (CGColorEqualToColor(color.CGColor, [UIColor flatYellowColor].CGColor)) {
        string = @"Yellow";
        
    } else if (CGColorEqualToColor(color.CGColor, [UIColor flatBlueColor].CGColor)) {
        string = @"Blue";
    }
    
    return string;
}
```

Note: I'm using a library called [Chameleon](https://github.com/ViccAlexander/Chameleon) that has an awesome collection of super nice colors. Once you go Chameleon you never go back.

Let's write the implementation for our action, which is called when any of the connected buttons are pressed. They are then passed in as the `UIButton` argument, giving us access to its instance and retirement funds.

```
- (IBAction)selectedTile:(UIButton *)sender {
    NSString *colorName = [self stringFromUIColor:sender.backgroundColor];
    NSString *selectedText = [NSString stringWithFormat:@"Selected the %@ tile!", colorName];
    
    self.selectedTileLabel.text = selectedText;
}
```

Note in the above screenshot that I've also created a `UILabel` to be updated each time a button is pressed to let us know which color has been selected.

Lastly, to avoid the issue of comparing `UIColor` which is sort of [difficult,](http://stackoverflow.com/a/21622229/6030938) I also utilize the `tile` outlets to explicitly assign them colors on the view's initial load.

```
NSArray *colors = @[ [UIColor flatRedColor], [UIColor flatGreenColorDark],
                     [UIColor flatYellowColor], [UIColor flatBlueColor]
                   ];
    
    for (NSUInteger i = 0; i < self.tiles.count; i++) {
        UIButton *tile = self.tiles[i];
        tile.backgroundColor = colors[i];
    }
```

In the `for` loop, I iterate over all the connected `UIButton`s and assign their `backgroundColor` property. This is a great example on how outlet connections can be used to condense code when your elements have most things in common. Without a collection, you'd have to go one-by-one and assign values to each button. This comes in handy especially when assigning multiple qualities to buttons since you can treat one button as though it were all of them. The power of the loop!

Also it is important to keep in mind that `IBOutletCollection` doesn't guarantee the order of objects inside of its array, especially across Xcode projects.

Without further ado here is our somewhat-complete game of Simon:

![]({{ site.url }}/assets/img/flatiron/collections/colors.gif)
