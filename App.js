import {StyleSheet} from 'react-native';
import BottomTabNavigator from "./component/BottomTabNavigator";


export default function App() {
  return <BottomTabNavigator />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
