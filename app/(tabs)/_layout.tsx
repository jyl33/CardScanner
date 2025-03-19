import { Tabs } from "expo-router"
import { Table, QrCode, Cog, Receipt } from "lucide-react-native"

export default () => {
    return(
        <Tabs>
            <Tabs.Screen name="inventory" options={{
                tabBarLabel: "Inventory",
                tabBarIcon: ({ color }) => (
                    <Table color={color}/>
                  ),
            
            }}/>
            <Tabs.Screen name="add"options={{
                tabBarLabel: "Scan",
                tabBarIcon: ({ color }) => (
                    <QrCode color={color}/>
                  ),
            }}/>
            <Tabs.Screen name="orders" options={{
                tabBarLabel: "Orders",
                tabBarIcon: ({ color }) => (
                    <Receipt color={color}/>
                  ),
            }}/>
            <Tabs.Screen name="settings" options={{
                tabBarLabel: "Settings",
                tabBarIcon: ({ color }) => (
                    <Cog color={color}/>
                  ),
            }}/>
            
        </Tabs>
    )
}
