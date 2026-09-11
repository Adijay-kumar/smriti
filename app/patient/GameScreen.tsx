import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Alert, ScrollView,
} from 'react-native';
import { getPatient, saveSession, getRecentSessions } from '../../utils/storage';
import { applyAdaptation } from '../../utils/adaptive';
import { Patient, WORD_PAIRS, DIFFICULTY_LABELS } from '../../utils/mockData';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';
import { api } from '../../utils/api';

interface Props { navigation: any; route: any; }

interface Card { id: number; word: string; emoji: string; matched: boolean; flipped: boolean; }

function buildCards(difficulty: 1 | 2 | 3): Card[] {
  const pairs = WORD_PAIRS[difficulty].slice(0, 4); // 4 pairs = 8 cards
  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    cards.push({ id: i * 2,     word: pair[0], emoji: pair[1], matched: false, flipped: false });
    cards.push({ id: i * 2 + 1, word: pair[0], emoji: pair[1], matched: false, flipped: false });
  });
  // shuffle
  return cards.sort(() => Math.random() - 0.5);
}

export default function GameScreen({ navigation, route }: Props) {
  const { patientId } = route.params || {};
  const [patient, setPatient] = useState<Patient | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const lastFlipTime = useRef(Date.now());

  useEffect(() => {
    getPatient(patientId).then(p => {
      if (p) { setPatient(p); setCards(buildCards(p.difficulty)); }
    });
  }, [patientId]);

  const handleFlip = (idx: number) => {
    if (selected.length >= 2) return;
    if (cards[idx].flipped || cards[idx].matched) return;

    const now = Date.now();
    const rt = (now - lastFlipTime.current) / 1000;
    lastFlipTime.current = now;
    if (selected.length === 1) setResponseTimes(prev => [...prev, rt]);

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [a, b] = newSelected;
      setAttempts(prev => prev + 1);

      if (cards[a].word === cards[b].word) {
        // Match!
        setTimeout(() => {
          const matched = [...newCards];
          matched[a].matched = true;
          matched[b].matched = true;
          setCards(matched);
          setScore(prev => prev + 100);
          setSelected([]);

          if (matched.every(c => c.matched)) {
            finishGame(matched, attempts + 1);
          }
        }, 500);
      } else {
        // No match — flip back
        setTimeout(() => {
          const reset = [...newCards];
          reset[a].flipped = false;
          reset[b].flipped = false;
          setCards(reset);
          setSelected([]);
        }, 1000);
      }
    }
  };

    const finishGame = async (finalCards: Card[], totalAttempts: number) => {
    setGameOver(true);

    const totalTime   = (Date.now() - startTime) / 1000;
    const matched     = finalCards.filter(c => c.matched).length / 2;
    const totalPairs  = finalCards.length / 2;
    const accuracy    = Math.round((matched / totalPairs) * 100);
    const avgRT       = totalAttempts > 0 
        ? Math.round((totalTime / totalAttempts) * 10) / 10 
        : 0;

    const speedBonus  = Math.max(0, Math.round((10 - avgRT) * 10));
    const finalScore  = (matched * 100) + speedBonus;

    const session = {
        patient_id:        patientId,
        accuracy:          accuracy,
        avg_response_time: avgRT,
        score:             finalScore,
        attempts:          totalAttempts,
        correct_matches:   matched,
        total_pairs:       totalPairs,
        time_taken:        Math.round(totalTime * 10) / 10,
        difficulty:        patient?.difficulty ?? 1,
        completed:         true,
    };

    try {
        const result = await api.saveSession(session);
        
        Alert.alert(
            '🎉 Well Done!',
            `Score: ${finalScore}\n` +
            `Accuracy: ${accuracy}%\n` +
            `Matched: ${matched}/${totalPairs} pairs\n` +
            `Time: ${Math.round(totalTime)}s\n\n` +
            `Great job! Keep it up! 💪`,
            [{ text: 'Back Home', onPress: () => navigation.goBack() }]
        );
    } catch (e) {
        console.error('Session save error:', e);
        Alert.alert('Error', 'Could not save session: ' + (e instanceof Error ? e.message : String(e)));
    }
};
  if (!patient || !cards.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: FONTS.xl }}>Loading game… 🧠</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Memory Match</Text>
          <View style={styles.diffBadge}>
            <Text style={styles.diffText}>{DIFFICULTY_LABELS[patient.difficulty]}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>Find the matching pairs! 🔍</Text>

        {/* Score bar */}
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
          <Text style={styles.attemptsText}>Tries: {attempts}</Text>
        </View>

        {/* Card grid */}
        <View style={styles.grid}>
          {cards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.card,
                card.matched && styles.cardMatched,
                card.flipped && !card.matched && styles.cardFlipped,
                SHADOW.sm,
              ]}
              onPress={() => handleFlip(idx)}
              activeOpacity={0.8}
              disabled={card.matched}
            >
              {card.flipped || card.matched ? (
                <View style={styles.cardFront}>
                  <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  <Text style={styles.cardWord}>{card.word}</Text>
                </View>
              ) : (
                <Text style={styles.cardBack}>❓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.quitBtn}>
          <Text style={styles.quitText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.patientBg },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.textPrimary },
  diffBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full },
  diffText: { fontSize: FONTS.sm, fontWeight: '700', color: COLORS.primary },
  instruction: { fontSize: FONTS.lg, color: COLORS.textSecondary, textAlign: 'center' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: 14, borderRadius: RADIUS.md, ...SHADOW.sm },
  scoreText: { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.primary },
  attemptsText: { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    width: '44%',
    aspectRatio: 1,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFlipped: { backgroundColor: COLORS.white, borderWidth: 3, borderColor: COLORS.primary },
  cardMatched: { backgroundColor: '#E8F5F2', borderWidth: 3, borderColor: '#27AE60' },
  cardFront: { alignItems: 'center', gap: 6 },
  cardEmoji: { fontSize: 40 },
  cardWord: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  cardBack: { fontSize: 44 },
  quitBtn: { alignSelf: 'center', padding: 12 },
  quitText: { fontSize: FONTS.md, color: COLORS.textSecondary, fontWeight: '600' },
});
