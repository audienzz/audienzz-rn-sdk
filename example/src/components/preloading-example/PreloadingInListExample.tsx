import { OriginalBanner } from 'audienzz';
import React, { useState, useRef, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  type ViewToken,
} from 'react-native';
import { mockData, type ListItem } from '../preloading-example/MockData';

interface DynamicItemProps {
  item: ListItem;
  index: number;
  shouldLoadAd: boolean;
}

const DynamicItem: React.FC<DynamicItemProps> = ({ item, shouldLoadAd }) => {
  if (item.type === 'ad') {
    if (shouldLoadAd) {
      return (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
          }}
        >
          <OriginalBanner
            sizes={[{ width: 300, height: 250 }]}
            adUnitID="/96628199/testapp_publisher/banner_test_ad_unit"
            auConfigID="15624474"
            isLazyLoad={false}
            onAdLoaded={() => {console.log("Ad loaded", item.adId)}}
            onAdFailedToLoad={(error) => {console.log("Ad failed to load", item.adId, error)}}
          />
        </View>
      );
    } else {
      return <View style={{ width: 300, height: 250 }} />;
    }
  }

  return (
    <View
      style={{
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
      }}
    >
      <Text>{item.title}</Text>
      <Text>{item.content}</Text>
    </View>
  );
};

const PreloadingInListExample: React.FC = () => {
  const [data] = useState<ListItem[]>(mockData);
  const [activeAdIds, setActiveAdIds] = useState<Set<string>>(new Set());
  const itemRefs = useRef<{ [key: string]: View | null }>({});
  const TRIGGER_DISTANCE = 1500;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      const lastIndex : number | null = viewableItems[viewableItems.length - 1]?.index || 0;

      const newActiveAdIds = new Set<string>();

      const upcomingAds = data
        .slice(lastIndex + 1)
        .filter(item => item.type === 'ad')
        .slice(0, 2);

      upcomingAds.forEach(adItem => {
        if (!adItem.adId) return;

        const itemRef = itemRefs.current[adItem.id];

        if (itemRef) {
          itemRef.measureInWindow((_, y, __, ___) => {
            const pixelsToAd = Math.max(0, y);
            
            console.log(`Ad ${adItem.adId}: ${pixelsToAd}px away`);

            if (pixelsToAd <= TRIGGER_DISTANCE) {
              console.log(`Loading ad ${adItem.adId} - within ${TRIGGER_DISTANCE}px`);
              setActiveAdIds(prev => {
                const newSet = new Set(prev);
                newSet.add(adItem.adId!);
                return newSet;
              });
            }
          });
        }
      });

      viewableItems.forEach(token => {
        const item = token.item as ListItem;
        if (item.type === 'ad' && item.adId) {
          newActiveAdIds.add(item.adId);
        }
      });
    },
    [data]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => {
      const shouldLoadAd =
        item.type === 'ad' && item.adId ? activeAdIds.has(item.adId) : false;

      return (
        <View
          ref={(ref) => {
            itemRefs.current[item.id] = ref;
          }}
          collapsable={false}
        >
          <DynamicItem item={item} index={index} shouldLoadAd={shouldLoadAd} />
        </View>
      );
    },
    [activeAdIds]
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onViewableItemsChanged={onViewableItemsChanged}
        windowSize={9}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 10,
          minimumViewTime: 100,
        }}/>
      </View>
      );
};

export default PreloadingInListExample;