/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, Pressable} from 'react-native';
import DonutChart from './components/DonutChart';
import {useFont} from '@shopify/react-native-skia';
import {useSharedValue, withTiming} from 'react-native-reanimated';
import RenderItem from './components/RenderItem';
import {SafeAreaView} from 'react-native-safe-area-context';
import {fetchBudgetSummary} from './api/bankApi'; // Adjust the import path as necessary
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../constants/categories'; // Import categories

interface Data {
  value: number;
  percentage: number;
  color: string;
  category: string;
}

const RADIUS = 160;
const STROKE_WIDTH = 30;
const OUTER_STROKE_WIDTH = 46;
const GAP = 0.04;

type PeriodType = 'month' | 'quarter' | 'year';

export default function BudgetScreen() {
  const [data, setData] = useState<Data[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const totalValue = useSharedValue(0);
  const decimals = useSharedValue<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let startDate, endDate;

        switch (periodType) {
          case 'month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
          case 'quarter':
            const quarterStartMonth = Math.floor(currentDate.getMonth() / 3) * 3;
            startDate = new Date(currentDate.getFullYear(), quarterStartMonth, 1).toISOString().split('T')[0];
            endDate = new Date(currentDate.getFullYear(), quarterStartMonth + 3, 0).toISOString().split('T')[0];
            break;
          case 'year':
            startDate = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
            endDate = new Date(currentDate.getFullYear(), 11, 31).toISOString().split('T')[0];
            break;
        }

        const result = await fetchBudgetSummary(startDate, endDate);
        const totalAmountArray = result.total_amount; // Access the array

        if (!Array.isArray(totalAmountArray)) {
          throw new Error('Expected total_amount to be an array');
        }

        const total = totalAmountArray.reduce(
          (acc: number, currentValue: { amount: number }) => acc + currentValue.amount,
          0,
        );

        const generatePercentages = totalAmountArray.map((item, index) => {
          const category = categories.find(cat => cat.name === item.category);
          return {
            value: parseFloat(item.amount.toFixed(2)),
            percentage: (item.amount / total) * 100,
            color: category?.color || '#cccccc',
            category: item.category,
            iconName: category?.iconName,
            iconSet: category?.iconSet,
          };
        });

        // Group small segments into "Other"
        const significantSegments = generatePercentages.filter(item => item.percentage >= 5);
        const otherSegments = generatePercentages.filter(item => item.percentage < 5);

        const otherTotal = otherSegments.reduce((acc, item) => acc + item.value, 0);
        const otherPercentage = otherSegments.reduce((acc, item) => acc + item.percentage, 0);

        if (otherSegments.length > 0) {
          significantSegments.push({
            value: parseFloat(otherTotal.toFixed(2)),
            percentage: otherPercentage,
            color: '#cccccc', // Use a default color for "Other"
            category: 'Other',
            iconName: 'help-circle-outline',
            iconSet: 'Ionicons',
          });
        }

        const generateDecimals = significantSegments.map(
          (item) => item.percentage / 100,
        );

        // Normalize decimals to ensure they sum to 1
        const totalDecimals = generateDecimals.reduce((acc, val) => acc + val, 0);
        const normalizedDecimals = generateDecimals.map((decimal) => decimal / totalDecimals);

        totalValue.value = withTiming(total, { duration: 1000 });
        decimals.value = [...normalizedDecimals];

        setData(significantSegments);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentDate, periodType]);

  const formatPeriod = (date: Date, type: PeriodType) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric' };
    switch (type) {
      case 'month':
        options.month = 'long';
        break;
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
    }
    return date.toLocaleString('default', options);
  };

  const changePeriod = (increment: number) => {
    const newDate = new Date(currentDate);
    switch (periodType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + increment);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + (3 * increment));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + increment);
        break;
    }
    setCurrentDate(newDate);
  };

  const font = useFont(require('./../assets/fonts/Roboto-Bold.ttf'), 60);
  const smallFont = useFont(require('./../assets/fonts/Roboto-Light.ttf'), 25);

  if (!font || !smallFont) {
    return <View />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.periodSelector}>
        <Pressable onPress={() => changePeriod(-1)} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </Pressable>
        <View>
          <Text style={styles.periodText}>{formatPeriod(currentDate, periodType)}</Text>
          <View style={styles.periodTypeSelector}>
            <Pressable
              onPress={() => setPeriodType('month')}
              style={[styles.periodTypeButton, periodType === 'month' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'month' && styles.activePeriodTypeText]}>Mois</Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriodType('quarter')}
              style={[styles.periodTypeButton, periodType === 'quarter' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'quarter' && styles.activePeriodTypeText]}>Trimestre</Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriodType('year')}
              style={[styles.periodTypeButton, periodType === 'year' && styles.activePeriodType]}
            >
              <Text style={[styles.periodTypeText, periodType === 'year' && styles.activePeriodTypeText]}>Année</Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => changePeriod(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{alignItems: 'center'}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          <DonutChart
            radius={RADIUS}
            gap={GAP}
            strokeWidth={STROKE_WIDTH}
            outerStrokeWidth={OUTER_STROKE_WIDTH}
            font={font}
            smallFont={smallFont}
            totalValue={totalValue}
            n={data.length}
            decimals={decimals}
            colors={data.map(item => item.color)} // Use colors from data
          />
        </View>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            {item.iconSet === 'Ionicons' && (
              <Ionicons name={item.iconName} size={20} color="white" style={styles.icon} />
            )}
            <Text style={styles.legendLabel}>{item.category}</Text>
            <Text style={styles.legendValue}>{item.value.toLocaleString()} €</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  arrowButton: {
    padding: 10,
  },
  periodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  periodTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  periodTypeButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  activePeriodType: {
    backgroundColor: '#007AFF',
  },
  periodTypeText: {
    fontSize: 12,
    color: '#333',
  },
  activePeriodTypeText: {
    color: '#fff',
  },
  chartContainer: {
    width: RADIUS * 2,
    height: RADIUS * 2,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  icon: {
    marginRight: 10,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    marginVertical: 40,
    backgroundColor: '#f4f7fc',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
  },
});
