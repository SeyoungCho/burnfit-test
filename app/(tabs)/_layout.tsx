import { Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#329EFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          height: 70,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "HOME",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "CALENDAR",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "LIBRARY",
          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome6 name="dumbbell" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "MY PAGE",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
