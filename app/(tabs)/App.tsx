import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent, GestureHandlerRootView } from 'react-native-gesture-handler';

const emojis = ["🍞", "🍗", "🐟", "🥕", "🥒"];

// Array of image sources and their coordinates
const imagesData = [
  { source: require('@/assets/images/plato_vacio.jpg'), x: 0, y: 0, width: 450, height: 400 },
];

type EmojiData = {
  translateX: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
  contextX: Animated.SharedValue<{ translateX: number }>;
  contextY: Animated.SharedValue<{ translateY: number }>;
};

export default function App() {
  const [counter, setCounter] = useState(0);
  const [emojiPositions, setEmojiPositions] = useState<{ [key: number]: { x: number, y: number } }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prevCounter => {
        if (prevCounter < 10) {
          return prevCounter + 1;
        } else {
          clearInterval(interval);
          return prevCounter;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const emojisData: EmojiData[] = emojis.map(() => ({
    translateX: useSharedValue(0),
    translateY: useSharedValue(0),
    opacity: useSharedValue(1),
    contextX: useSharedValue({ translateX: 0 }),
    contextY: useSharedValue({ translateY: 0 }),
  }));

  const createGestureHandler = (emojiData: EmojiData, index: number) => ({
    onGestureEvent: (event: PanGestureHandlerGestureEvent) => {
      emojiData.translateX.value = emojiData.contextX.value.translateX + event.nativeEvent.translationX;
      emojiData.translateY.value = emojiData.contextY.value.translateY + event.nativeEvent.translationY;

      // Update the emoji position state on each gesture event
      setEmojiPositions(prevPositions => ({
        ...prevPositions,
        [index]: {
          x: emojiData.translateX.value,
          y: emojiData.translateY.value,
        }
      }));
    },
    onHandlerStateChange: (event: PanGestureHandlerGestureEvent) => {
      if (event.nativeEvent.state === 5) { // Gesture end
        const emojiX = emojiData.translateX.value;
        const emojiY = emojiData.translateY.value;
    
        const imageBounds = imagesData[0];
        
        // Check if the emoji is within the image bounds
        const isInsideImage = (
          emojiX >= imageBounds.x &&
          emojiX <= imageBounds.x + imageBounds.width &&
          emojiY >= imageBounds.y &&
          emojiY <= imageBounds.y + imageBounds.height
        );
        
        const isInsideCereals = (
          (emojiX >= -163 && emojiX <= -1)  &&
          (emojiY >= -70 && emojiY <= -237)
        );

        console.log("X axis -> " + emojiX);
        console.log("Y axis -> " + emojiY);
        // Set opacity to 0 if inside the image bounds, otherwise keep it visible
        if (isInsideCereals) {
          emojiData.opacity.value = 0;
        } else {
          emojiData.opacity.value = 1;
        }
    
        // Update context position for future gesture calculations
        emojiData.contextX.value = { translateX: emojiX };
        emojiData.contextY.value = { translateY: emojiY };
      }
    }
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      {imagesData.map((image, index) => (
        <Animated.Image
          key={index}
          source={image.source}
          style={[styles.image, { top: image.y, left: image.x, width: image.width, height: image.height }]}
        />
      ))}

      {/* Add a View to hold the emojis and set it to flexDirection: 'row' */}
      <View style={styles.emojiContainer}>
        {emojis.map((emoji, index) => {
          const emojiData = emojisData[index];
          const rStyle = useAnimatedStyle(() => ({
            transform: [
              { translateX: emojiData.translateX.value },
              { translateY: emojiData.translateY.value },
            ],
            opacity: emojiData.opacity.value,
          }));

          return (
            <PanGestureHandler
              key={index}
              onGestureEvent={createGestureHandler(emojiData, index).onGestureEvent}
              onHandlerStateChange={createGestureHandler(emojiData, index).onHandlerStateChange}
            >
              <Animated.Text style={[styles.emoji, rStyle]}>
                {emoji}
              </Animated.Text>
            </PanGestureHandler>
          );
        })}
      </View>

      <Text style={styles.counter}>Puntos: {counter}</Text>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    flexDirection: 'row', // Align emojis horizontally
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Add some space between emojis and the image
  },
  emoji: {
    fontSize: 40,
    marginHorizontal: 10,
  },
  counter: {
    position: 'absolute',
    bottom: 100,
    fontSize: 50,
    color: 'black',
    textAlign: 'center',
  },
  image: {
    position: 'absolute',
    resizeMode: 'contain',
  },
  position: {
    fontSize: 16,
    color: 'black',
    position: 'absolute',
    top: 10,
  },
});
