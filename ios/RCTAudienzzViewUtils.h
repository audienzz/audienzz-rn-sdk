/*
    Copyright 2025 Audienzz AG

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

#import <UIKit/UIKit.h>

@interface RCTAudienzzViewUtils : NSObject

/// M9: returns the root view controller of the app's key window using the scene API (iOS 13+),
/// falling back to the app delegate's window. Replaces the fragile
/// `[[[[UIApplication sharedApplication] delegate] window] rootViewController]` pattern, which
/// returns nil on scene-based apps whose delegate has no `window`.
+ (UIViewController *_Nullable)currentRootViewController;

@end
