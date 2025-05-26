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

#import "AudienzzUtils.h"

@implementation AudienzzUtils

+ (AUMORTBAppContent *)createContentObjectFromDictionary:(NSDictionary *)dictionary {
    AUMORTBAppContent *appContent = [[AUMORTBAppContent alloc] init];
    
    if ([dictionary[@"id"] isKindOfClass:[NSString class]]) {
        appContent.id = dictionary[@"id"];
    }
    if ([dictionary[@"episode"] isKindOfClass:[NSNumber class]]) {
        appContent.episode = dictionary[@"episode"];
    }
    if ([dictionary[@"title"] isKindOfClass:[NSString class]]) {
        appContent.title = dictionary[@"title"];
    }
    if ([dictionary[@"series"] isKindOfClass:[NSString class]]) {
        appContent.series = dictionary[@"series"];
    }
    if ([dictionary[@"season"] isKindOfClass:[NSString class]]) {
        appContent.season = dictionary[@"season"];
    }
    if ([dictionary[@"artist"] isKindOfClass:[NSString class]]) {
        appContent.artist = dictionary[@"artist"];
    }
    if ([dictionary[@"genre"] isKindOfClass:[NSString class]]) {
        appContent.genre = dictionary[@"genre"];
    }
    if ([dictionary[@"album"] isKindOfClass:[NSString class]]) {
        appContent.album = dictionary[@"album"];
    }
    if ([dictionary[@"isrc"] isKindOfClass:[NSString class]]) {
        appContent.isrc = dictionary[@"isrc"];
    }
    if ([dictionary[@"url"] isKindOfClass:[NSString class]]) {
        appContent.url = dictionary[@"url"];
    }
    if (![dictionary[@"categories"] isKindOfClass:[NSArray class]]) {
        appContent.cat = nil;
    } else {
        appContent.cat = dictionary[@"categories"];
    }
    if ([dictionary[@"productionQuality"] isKindOfClass:[NSNumber class]]) {
        appContent.prodq = dictionary[@"productionQuality"];
    }
    if ([dictionary[@"context"] isKindOfClass:[NSNumber class]]) {
        appContent.context = dictionary[@"context"];
    }
    if ([dictionary[@"contentRating"] isKindOfClass:[NSString class]]) {
        appContent.contentrating = dictionary[@"contentRating"];
    }
    if ([dictionary[@"userRating"] isKindOfClass:[NSString class]]) {
        appContent.userrating = dictionary[@"userRating"];
    }
    if ([dictionary[@"qaMediaRating"] isKindOfClass:[NSNumber class]]) {
        appContent.qagmediarating = dictionary[@"qaMediaRating"];
    }
    if ([dictionary[@"keywords"] isKindOfClass:[NSString class]]) {
        appContent.keywords = dictionary[@"keywords"];
    }
    if ([dictionary[@"liveStream"] isKindOfClass:[NSNumber class]]) {
        appContent.livestream = dictionary[@"liveStream"];
    }
    if ([dictionary[@"sourceRelationship"] isKindOfClass:[NSNumber class]]) {
        appContent.sourcerelationship = dictionary[@"sourceRelationship"];
    }
    if ([dictionary[@"length"] isKindOfClass:[NSNumber class]]) {
        appContent.len = dictionary[@"length"];
    }
    if ([dictionary[@"language"] isKindOfClass:[NSString class]]) {
        appContent.language = dictionary[@"language"];
    }
    if ([dictionary[@"embeddable"] isKindOfClass:[NSNumber class]]) {
        appContent.embeddable = dictionary[@"embeddable"];
    }
    if (!dictionary[@"dataObject"] && ![dictionary[@"dataObject"] isKindOfClass:[NSDictionary class]]) {
        appContent.data = nil;
    } else {
        appContent.data = [self parseContentData:dictionary[@"dataObject"]];
    }
    if (dictionary[@"producerObject"] && [dictionary[@"producerObject"] isKindOfClass:[NSDictionary class]]) {
        appContent.producer = [self parseProducer:dictionary[@"producerObject"]];
    } else {
        appContent.producer = nil;
    }
    
    return appContent;
}

+ (NSArray<AUMORTBContentData *> *)parseContentData:(NSDictionary *)dataObject {
    NSMutableArray<AUMORTBContentData *> *contentDataArray = [NSMutableArray array];
    
    AUMORTBContentData *contentData = [[AUMORTBContentData alloc] init];
    if ([dataObject[@"id"] isKindOfClass:[NSString class]]) {
        contentData.id = dataObject[@"id"];
    }
    if ([dataObject[@"name"] isKindOfClass:[NSString class]]) {
        contentData.name = dataObject[@"name"];
    }
    if (![dataObject[@"segments"] isKindOfClass:[NSArray class]]) {
        contentData.segment = nil;
    } else {
        contentData.segment = [self parseSegments:dataObject[@"segments"]];
    }
    
    [contentDataArray addObject:contentData];
    
    return contentDataArray;
}

+ (NSArray<AUMORTBContentSegment *> *)parseSegments:(NSArray *)segmentsArray {
    NSMutableArray<AUMORTBContentSegment *> *segments = [NSMutableArray array];
    for (NSDictionary *segmentDict in segmentsArray) {
        if (![segmentDict isKindOfClass:[NSDictionary class]]) {
            continue;
        }
        
        AUMORTBContentSegment *segment = [[AUMORTBContentSegment alloc] init];
        if ([segmentDict[@"id"] isKindOfClass:[NSString class]]) {
            segment.id = segmentDict[@"id"];
        }
        if ([segmentDict[@"name"] isKindOfClass:[NSString class]]) {
            segment.name = segmentDict[@"name"];
        }
        if ([segmentDict[@"value"] isKindOfClass:[NSString class]]) {
            segment.value = segmentDict[@"value"];
        }
        [segments addObject:segment];
    }
    return segments;
}

+ (AUMORTBContentProducer *)parseProducer:(NSDictionary *)producerDict {
    if (![producerDict isKindOfClass:[NSDictionary class]]) {
        return nil;
    }
    
    AUMORTBContentProducer *producer = [[AUMORTBContentProducer alloc] init];
    if ([producerDict[@"id"] isKindOfClass:[NSString class]]) {
        producer.id = producerDict[@"id"];
    }
    if ([producerDict[@"name"] isKindOfClass:[NSString class]]) {
        producer.name = producerDict[@"name"];
    }
    if ([producerDict[@"domain"] isKindOfClass:[NSString class]]) {
        producer.domain = producerDict[@"domain"];
    }
    if ([producerDict[@"categories"] isKindOfClass:[NSArray class]]) {
        producer.cat = producerDict[@"categories"];
    } else {
        producer.cat = @[];
    }
    return producer;
}

@end
