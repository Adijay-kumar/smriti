// console.warn('=== IDCard RENDERED ===');
// console.warn('route.params:', JSON.stringify(route?.params));
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import * as Linking from 'expo-linking';
// import { getPatient } from '../../utils/storage';
// import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface PatientData {
//   id: string;
//   caregiver_id: string;
//   name: string;
//   age: number;
//   date_of_birth?: string | null;
//   language: string;
//   difficulty: number;
//   photo_url?: string | null;
//   location?: string | null;
//   blood_group?: string | null;
//   emergency_contact?: string | null;
//   emergency_contact_name?: string | null;
//   medical_info?: string | null;
// }

// interface Props {
//   route: {
//     params: {
//       patientId: string;
//     };
//   };
//   navigation: any;
// }

// export default function IDCardScreen({ route }: Props) {
//   const [patient, setPatient] = useState<PatientData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     load();
//   }, [route.params.patientId]);

//   async function load() {
//   try {
//     const raw = await AsyncStorage.getItem('smriti_current_user');
//     const user = raw ? JSON.parse(raw) : null;
//     const token = user?.access_token;
//     const id = route.params.patientId;

//     const res = await fetch(`http://192.168.1.11:8000/patients/${id}`, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     });
//     const data = await res.json();
//     console.log('DIRECT FETCH:', res.status, data);
//     setPatient(data.id ? data : null);
//   } catch (e) {
//     console.error('load error:', e);
//     setPatient(null);
//   } finally {
//     setLoading(false);
//   }
// }

//   async function pickPhoto() {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       console.log('Photo picked:', result.assets[0].uri);
//       Alert.alert(
//         'Photo selected',
//         'Photo upload to the server will be added later.'
//       );
//     }
//   }

//   async function openLocation() {
//     if (!patient?.location) {
//       Alert.alert('No location set');
//       return;
//     }

//     const url =
//       `https://www.google.com/maps/search/` +
//       `${encodeURIComponent(patient.location)}`;

//     await Linking.openURL(url);
//   }

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Loading ID card...</Text>
//       </View>
//     );
//   }

//   if (!patient) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.notFoundIcon}>🪪</Text>
//         <Text style={styles.notFoundTitle}>Patient not found</Text>
//         <Text style={styles.notFoundText}>
//           Could not load the patient information.
//         </Text>
//       </View>
//     );
//   }

//   const dob = patient.date_of_birth
//     ? new Date(patient.date_of_birth).toLocaleDateString('en-IN')
//     : 'N/A';

//   return (
//     <SafeAreaView style={styles.safe}>
//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         showsVerticalScrollIndicator={false}
//       >

//         {/* Header Card */}
//         <View style={[styles.headerCard, SHADOW.md]}>
//           <View style={styles.stripe} />

//           <View style={styles.headerRow}>

//             {/* Photo */}
//             <TouchableOpacity
//               onPress={pickPhoto}
//               style={styles.photoBox}
//             >
//               {patient.photo_url ? (
//                 <Image
//                   source={{ uri: patient.photo_url }}
//                   style={styles.photo}
//                 />
//               ) : (
//                 <Text style={styles.photoPlaceholder}>👤</Text>
//               )}
//             </TouchableOpacity>

//             {/* Name + ID */}
//             <View style={styles.headerInfo}>
//               <Text style={styles.nameText}>
//                 {patient.name}
//               </Text>

//               <Text style={styles.idText}>
//                 ID: SMR-{patient.id.slice(0, 8).toUpperCase()}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Age / DOB */}
//         <View style={styles.section}>
//           <View style={styles.infoRow}>
//             <Text style={styles.icon}>📅</Text>

//             <View>
//               <Text style={styles.label}>
//                 Age / Date of Birth
//               </Text>

//               <Text style={styles.value}>
//                 {patient.age} years · {dob}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Blood Group */}
//         {patient.blood_group && (
//           <View style={styles.section}>
//             <View style={styles.infoRow}>
//               <Text style={styles.icon}>💧</Text>

//               <View>
//                 <Text style={styles.label}>
//                   Blood Group
//                 </Text>

//                 <Text style={styles.value}>
//                   {patient.blood_group}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}

//         {/* Location */}
//         {patient.location && (
//           <TouchableOpacity
//             onPress={openLocation}
//             style={styles.section}
//           >
//             <View style={styles.infoRow}>
//               <Text style={styles.icon}>📍</Text>

//               <View style={{ flex: 1 }}>
//                 <Text style={styles.label}>
//                   Home Location
//                 </Text>

//                 <Text
//                   style={[
//                     styles.value,
//                     {
//                       color: COLORS.primary,
//                       textDecorationLine: 'underline',
//                     },
//                   ]}
//                 >
//                   {patient.location}
//                 </Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* Language */}
//         <View style={styles.section}>
//           <View style={styles.infoRow}>
//             <Text style={styles.icon}>🌐</Text>

//             <View>
//               <Text style={styles.label}>
//                 Language
//               </Text>

//               <Text style={styles.value}>
//                 {patient.language}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Medical Information */}
//         {patient.medical_info && (
//           <View
//             style={[
//               styles.section,
//               styles.medicalBox,
//             ]}
//           >
//             <Text style={styles.medicalTitle}>
//               ⚠️ Medical Information
//             </Text>

//             <Text style={styles.medicalText}>
//               {patient.medical_info}
//             </Text>
//           </View>
//         )}

//         {/* Emergency Contact */}
//         {patient.emergency_contact && (
//           <TouchableOpacity
//             onPress={() =>
//               Linking.openURL(
//                 `tel:${patient.emergency_contact}`
//               )
//             }
//             style={[
//               styles.section,
//               styles.emergencyBox,
//             ]}
//           >
//             <Text style={styles.emergencyText}>
//               📞 {patient.emergency_contact}
//             </Text>

//             {patient.emergency_contact_name && (
//               <Text style={styles.emergencyName}>
//                 {patient.emergency_contact_name}
//               </Text>
//             )}
//           </TouchableOpacity>
//         )}

//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },

//   scroll: {
//     padding: 16,
//     gap: 12,
//     paddingBottom: 40,
//   },

//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },

//   loadingText: {
//     marginTop: 12,
//     fontSize: FONTS.md,
//     color: COLORS.textSecondary,
//   },

//   notFoundIcon: {
//     fontSize: 50,
//     marginBottom: 12,
//   },

//   notFoundTitle: {
//     fontSize: FONTS.xl,
//     fontWeight: '800',
//     color: COLORS.textPrimary,
//   },

//   notFoundText: {
//     fontSize: FONTS.md,
//     color: COLORS.textSecondary,
//     marginTop: 6,
//     textAlign: 'center',
//   },

//   stripe: {
//     height: 8,
//     backgroundColor: COLORS.accent,
//     borderRadius: RADIUS.xs,
//     marginBottom: 12,
//   },

//   headerCard: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.xl,
//     padding: 16,
//     marginBottom: 8,
//   },

//   headerRow: {
//     flexDirection: 'row',
//     gap: 16,
//     alignItems: 'center',
//   },

//   photoBox: {
//     width: 80,
//     height: 80,
//     borderRadius: RADIUS.lg,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },

//   photo: {
//     width: '100%',
//     height: '100%',
//   },

//   photoPlaceholder: {
//     fontSize: 40,
//   },

//   headerInfo: {
//     flex: 1,
//   },

//   nameText: {
//     fontSize: FONTS.xl,
//     fontWeight: '800',
//     color: '#fff',
//   },

//   idText: {
//     fontSize: FONTS.sm,
//     color: '#ddd',
//     marginTop: 4,
//   },

//   section: {
//     backgroundColor: '#fff',
//     borderRadius: RADIUS.lg,
//     padding: 14,
//     ...SHADOW.sm,
//   },

//   infoRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },

//   icon: {
//     fontSize: 24,
//   },

//   label: {
//     fontSize: FONTS.xs,
//     color: COLORS.textSecondary,
//     textTransform: 'uppercase',
//     fontWeight: '700',
//   },

//   value: {
//     fontSize: FONTS.md,
//     color: COLORS.textPrimary,
//     marginTop: 2,
//     fontWeight: '500',
//   },

//   medicalBox: {
//     backgroundColor: '#fffaf0',
//     borderColor: COLORS.accent,
//     borderWidth: 1.5,
//   },

//   medicalTitle: {
//     fontSize: FONTS.md,
//     fontWeight: '700',
//     color: COLORS.accent,
//     marginBottom: 8,
//   },

//   medicalText: {
//     fontSize: FONTS.sm,
//     color: COLORS.textPrimary,
//     lineHeight: 20,
//   },

//   emergencyBox: {
//     backgroundColor: COLORS.danger,
//     borderRadius: RADIUS.xl,
//   },

//   emergencyText: {
//     fontSize: FONTS.lg,
//     fontWeight: '700',
//     color: '#fff',
//   },

//   emergencyName: {
//     fontSize: FONTS.sm,
//     color: '#ddd',
//     marginTop: 4,
//   },
// });

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Linking from 'expo-linking';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';

interface Props {
  route: any;
  navigation: any;
}

export default function IDCardScreen({ route }: Props) {
  // Hardcoded for demo — swap with real API later
  const patient = {
    id: 'bd70eed0-989a-4d99-a8dd-5be6cedce063',
    name: 'Ravi Kumar',
    age: 72,
    date_of_birth: '15 March 1952',
    language: 'Hindi',
    difficulty: 1,
    blood_group: 'B+',
    location: 'New Delhi, India',
    emergency_contact: '+919876543210',
    emergency_contact_name: 'Priya (Daughter)',
    medical_info: 'Mild cognitive impairment. Hypertension. On daily medication.',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Header Card */}
        <View style={[styles.headerCard, SHADOW.md]}>
          <View style={styles.stripe} />
          <View style={styles.headerRow}>
            <View style={styles.photoBox}>
              <Text style={styles.photoPlaceholder}>👴</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.nameText}>{patient.name}</Text>
              <Text style={styles.idText}>
                ID: SMR-{patient.id.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Age / DOB */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📅</Text>
            <View>
              <Text style={styles.label}>Age / Date of Birth</Text>
              <Text style={styles.value}>
                {patient.age} years · {patient.date_of_birth}
              </Text>
            </View>
          </View>
        </View>

        {/* Blood Group */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>💧</Text>
            <View>
              <Text style={styles.label}>Blood Group</Text>
              <Text style={styles.value}>{patient.blood_group}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <TouchableOpacity
          style={styles.section}
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/${encodeURIComponent(patient.location)}`
            )
          }
        >
          <View style={styles.infoRow}>
            <Text style={styles.icon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Home Location</Text>
              <Text style={[styles.value, { color: COLORS.primary, textDecorationLine: 'underline' }]}>
                {patient.location}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Language */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.icon}>🌐</Text>
            <View>
              <Text style={styles.label}>Language</Text>
              <Text style={styles.value}>{patient.language}</Text>
            </View>
          </View>
        </View>

        {/* Medical Info */}
        <View style={[styles.section, styles.medicalBox]}>
          <Text style={styles.medicalTitle}>⚠️ Medical Information</Text>
          <Text style={styles.medicalText}>{patient.medical_info}</Text>
        </View>

        {/* Emergency Contact */}
        <TouchableOpacity
          style={[styles.section, styles.emergencyBox]}
          onPress={() => Linking.openURL(`tel:${patient.emergency_contact}`)}
        >
          <Text style={styles.emergencyText}>
            📞 {patient.emergency_contact}
          </Text>
          <Text style={styles.emergencyName}>
            {patient.emergency_contact_name}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  stripe: {
    height: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.xs,
    marginBottom: 12,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: FONTS.xl,
    fontWeight: '800',
    color: '#fff',
  },
  idText: {
    fontSize: FONTS.sm,
    color: '#ddd',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: 14,
    ...SHADOW.sm,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  value: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    marginTop: 2,
    fontWeight: '500',
  },
  medicalBox: {
    backgroundColor: '#fffaf0',
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  medicalTitle: {
    fontSize: FONTS.md,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 8,
  },
  medicalText: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  emergencyBox: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.xl,
  },
  emergencyText: {
    fontSize: FONTS.lg,
    fontWeight: '700',
    color: '#fff',
  },
  emergencyName: {
    fontSize: FONTS.sm,
    color: '#ddd',
    marginTop: 4,
  },
});