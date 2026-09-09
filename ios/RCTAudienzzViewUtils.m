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

#import "RCTAudienzzViewUtils.h"

@implementation RCTAudienzzViewUtils

+ (UIWindow *)keyWindow {
  UIWindow *fallback = nil;

  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:[UIWindowScene class]]) {
      continue;
    }

    UIWindowScene *windowScene = (UIWindowScene *)scene;
    for (UIWindow *window in windowScene.windows) {
      if (window.isKeyWindow) {
        return window;
      }
      // Prefer a foreground-active scene's window if no key window turns up.
      if (fallback == nil && scene.activationState == UISceneActivationStateForegroundActive) {
        fallback = window;
      }
    }
  }

  return fallback;
}

+ (UIViewController *)currentRootViewController {
  UIWindow *window = [self keyWindow];
  if (window != nil) {
    return window.rootViewController;
  }

  // Last-resort fallback for setups without an active window scene.
  id<UIApplicationDelegate> delegate = UIApplication.sharedApplication.delegate;
  if ([delegate respondsToSelector:@selector(window)]) {
    return delegate.window.rootViewController;
  }

  return nil;
}

@end
