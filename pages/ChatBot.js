import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useChat } from 'react-native-vercel-ai';

const ChatBot = ({ userLocation, markers }) => {
  const flatListRef = useRef(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'http://172.16.2.194:3000/api/chat',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: "Hello, I am Katsuka from Fesi'Pop. I am here to help you with any questions you may have. Please let me know how I can assist you.",
    }],
    body: {
      context: `User location: lat ${userLocation.latitude}, lon ${userLocation.longitude}. There are ${markers.length} points of interest on the map.`,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    },
  });

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.messageText}>
        {item.content}
      </Text>
    </View>
  );

  const onSend = () => {
    handleSubmit();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      {isLoading && Platform.OS !== 'web' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B1464" />
          <Text>Loading...</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={(text) => {
            handleInputChange(Platform.OS === 'web' ? { target: { value: text } } : text);
          }}
          placeholder="Demander quelque chose..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messageList: {
    flex: 1,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#ECECEC',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#1B1464',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatBot;