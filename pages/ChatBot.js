import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useChat } from 'react-native-vercel-ai';
import * as Speech from 'expo-speech';
import { Volume1, Volume2 } from 'lucide-react-native';

const ChatBot = ({ userLocation, markers }) => {
  const flatListRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'http://172.16.2.194:3000/api/chat',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: "Bonjour, je suis Katsuka de Fesi'Pop. Je suis ici pour vous aider à répondre à vos questions. N'hésitez pas à me demander comment je peux vous aider.",
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

  const speakMessage = async (message) => {
    const isSpeakingNow = await Speech.isSpeakingAsync();
    if (isSpeakingNow) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(message, {
        language: 'fr',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
        voice: Platform.OS === 'ios' ? 'com.apple.ttsbundle.Amelie-compact' : undefined,
      });
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.messageText}>
        {item.content}
      </Text>
      {item.role === 'assistant' && (
        <TouchableOpacity onPress={() => speakMessage(item.content)} style={styles.speakButton}>
          {isSpeaking ? <Volume2 size={24} color="#1B1464" /> : <Volume1 size={24} color="#1B1464" />}
        </TouchableOpacity>
      )}
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
          onChangeText={handleInputChange}
          placeholder="Ask about locations or directions..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={onSend}>
          <Text style={styles.sendButtonText}>Send</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
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
  speakButton: {
    marginLeft: 10,
  },
});

export default ChatBot;