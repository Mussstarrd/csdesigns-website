/** Bottom tabs: Create | Vault | Settings. Create hosts the build stack. */
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fonts } from '../theme/index.js';

import HomeScreen from '../screens/HomeScreen.js';
import DescribeItScreen from '../screens/DescribeItScreen.js';
import BuildItScreen from '../screens/BuildItScreen.js';
import BlendItScreen from '../screens/BlendItScreen.js';
import OutputScreen from '../screens/OutputScreen.js';
import VaultScreen from '../screens/VaultScreen.js';
import SettingsScreen from '../screens/SettingsScreen.js';
import ArtistBrowserScreen from '../screens/ArtistBrowserScreen.js';
import PaywallScreen from '../screens/PaywallScreen.js';

const Tab = createBottomTabNavigator();
const CreateStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.body,
    card: colors.card,
    border: colors.border,
    text: colors.text,
    primary: colors.accent,
  },
};

const stackOptions = {
  headerStyle: { backgroundColor: colors.body },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 1 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.body },
};

function CreateStackScreen() {
  return (
    <CreateStack.Navigator screenOptions={stackOptions}>
      <CreateStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <CreateStack.Screen name="DescribeIt" component={DescribeItScreen} options={{ title: 'DESCRIBE IT' }} />
      <CreateStack.Screen name="BuildIt" component={BuildItScreen} options={{ title: 'BUILD IT' }} />
      <CreateStack.Screen name="BlendIt" component={BlendItScreen} options={{ title: 'BLEND IT' }} />
      <CreateStack.Screen name="Output" component={OutputScreen} options={{ title: 'PROMPT OUTPUT' }} />
      <CreateStack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'CIPHER PRO' }} />
    </CreateStack.Navigator>
  );
}

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator screenOptions={stackOptions}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
      <SettingsStack.Screen name="ArtistBrowser" component={ArtistBrowserScreen} options={{ title: 'ARTIST DECODER' }} />
    </SettingsStack.Navigator>
  );
}

function tabIcon(glyph) {
  return ({ color }) => <Text style={{ fontSize: 18, color }}>{glyph}</Text>;
}

export default function Navigation() {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textDim,
          tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 0.5 },
        }}
      >
        <Tab.Screen
          name="CreateTab"
          component={CreateStackScreen}
          options={{ title: 'Create', tabBarIcon: tabIcon('◉') }}
        />
        <Tab.Screen
          name="VaultTab"
          component={VaultScreen}
          options={{ title: 'Vault', tabBarIcon: tabIcon('▤') }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackScreen}
          options={{ title: 'Settings', tabBarIcon: tabIcon('⚙') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
