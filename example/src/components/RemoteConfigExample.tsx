import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RemoteConfigBanner, RemoteConfigInterstitial } from 'audienzz';
import ActionButton from './ActionButton';

export default function RemoteConfigExample() {
    const [showInterstitial, setShowInterstitial] = React.useState(false);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Remote Config Test</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fixed Size Banner (ID: 46)</Text>
                <View style={styles.bannerContainer}>
                    <RemoteConfigBanner
                        adConfigId="46"
                        style={styles.fixedBanner}
                        onAdLoaded={(size) => {
                            console.log('[RemoteConfig] Fixed banner loaded:', size);
                        }}
                        onAdFailedToLoad={(error) => {
                            console.log('[RemoteConfig] Fixed banner failed:', error);
                        }}
                        onAdClicked={() => {
                            console.log('[RemoteConfig] Fixed banner clicked');
                        }}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.longLabel}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vestibulum leo metus, sagittis nec finibus eu, viverra vel
                    eros. Donec lobortis, metus nec maximus viverra, nunc mi
                    fermentum lorem, quis fermentum est turpis ac risus.
                    Nullam sed nunc aliquam, scelerisque felis at, malesuada
                    magna. Aliquam tincidunt, odio at ultricies lacinia,
                    purus nunc feugiat ipsum, ac scelerisque purus elit
                    nec ligula. Donec neque quam, auctor sit amet velit
                    a, porta cursus metus. Nullam interdum posuere odio
                    quis ultricies. Donec vulputate vulputate magna,
                    eu scelerisque erat bibendum in.
                </Text>
            </View>

            <View style={styles.adaptiveSection}>
                <Text style={[styles.sectionTitle, styles.adaptiveSectionTitle]}>Adaptive Banner (ID: 48)</Text>
                <View style={styles.adaptiveBannerContainer}>
                    <RemoteConfigBanner
                        adConfigId="48"
                        style={styles.adaptiveBanner}
                        onAdLoaded={(size) => {
                            console.log('[RemoteConfig] Adaptive banner loaded:', size);
                        }}
                        onAdFailedToLoad={(error) => {
                            console.log('[RemoteConfig] Adaptive banner failed:', error);
                        }}
                        onAdClicked={() => {
                            console.log('[RemoteConfig] Adaptive banner clicked');
                        }}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Interstitial (ID: 47)</Text>
                <ActionButton labelButton="Show Interstitial" onPress={() => setShowInterstitial(true)} />
            </View>

            {showInterstitial && (
                <RemoteConfigInterstitial
                    adConfigId="47"
                    onAdLoaded={() => {
                        console.log('[RemoteConfig] Interstitial loaded successfully');
                    }}
                    onAdFailedToLoad={(error) => {
                        console.log('[RemoteConfig] Interstitial failed to load:', error);
                        setShowInterstitial(false);
                    }}
                    onAdOpened={() => {
                        console.log('[RemoteConfig] Interstitial opened');
                    }}
                    onAdClosed={() => {
                        console.log('[RemoteConfig] Interstitial closed');
                        setShowInterstitial(false);
                    }}
                    onAdClicked={() => {
                        console.log('[RemoteConfig] Interstitial clicked');
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    section: {
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 16,
    },
    adaptiveSection: {
        width: '100%',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    adaptiveSectionTitle: {
        marginHorizontal: 16,
    },
    bannerContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 8,
        minHeight: 100,
    },
    adaptiveBannerContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        minHeight: 100,
    },
    fixedBanner: {
        width: 300,
        height: 250,
    },
    adaptiveBanner: {
        width: '100%',
    },
    longLabel: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        textAlign: 'justify',
    },
    buttonSpacing: {
        height: 12,
    },
});
