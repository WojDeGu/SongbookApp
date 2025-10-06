// FileAccess.m
#import "FileAccess.h"
#import <React/RCTLog.h>

@implementation FileAccess

RCT_EXPORT_MODULE();

RCT_REMAP_METHOD(copyToTemp,
                 copyToTemp:(NSString *)path
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *url = [NSURL URLWithString:path];
  if (!url) {
    // maybe it is a file path
    url = [NSURL fileURLWithPath:path];
  }

  NSFileManager *fm = [NSFileManager defaultManager];
  NSString *tmp = NSTemporaryDirectory();
  NSString *destName = [[NSUUID UUID].UUIDString stringByAppendingFormat:@"-%@", [url lastPathComponent]];
  NSString *destPath = [tmp stringByAppendingPathComponent:destName];
  NSURL *destURL = [NSURL fileURLWithPath:destPath];

  BOOL didStart = NO;
  if ([url startAccessingSecurityScopedResource]) {
    didStart = YES;
  }

  if (didStart) {
    @try {
      if ([fm fileExistsAtPath:destPath]) {
        [fm removeItemAtPath:destPath error:nil];
      }
      [fm copyItemAtURL:url toURL:destURL error:nil];
      resolve(destPath);
    } @catch (NSException *exception) {
      reject(@"copy_error", exception.reason, nil);
    } @finally {
      [url stopAccessingSecurityScopedResource];
    }
    return;
  }

  // Fallback: coordinated read
  NSFileCoordinator *coord = [[NSFileCoordinator alloc] initWithFilePresenter:nil];
  NSError *coordErr = nil;
  [coord coordinateReadingItemAtURL:url options:0 error:&coordErr byAccessor:^(NSURL *newURL) {
    NSError *copyErr = nil;
    if ([fm fileExistsAtPath:destPath]) {
      [fm removeItemAtPath:destPath error:nil];
    }
    [fm copyItemAtURL:newURL toURL:destURL error:&copyErr];
    if (copyErr) {
      reject(@"copy_error", copyErr.localizedDescription, copyErr);
    } else {
      resolve(destPath);
    }
  }];
  if (coordErr) {
    reject(@"coord_error", coordErr.localizedDescription, coordErr);
  }
}

@end
