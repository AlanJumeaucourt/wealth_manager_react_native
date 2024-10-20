/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import DonutChart from './components/DonutChart';
import {useFont} from '@shopify/react-native-skia';
import {useSharedValue} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {fetchBudgetSummary} from './api/bankApi'; // Adjust the import path as necessary
import {Ionicons} from '@expo/vector-icons';
import {expenseCategories, incomeCategories} from '../constants/categories'; // Import both expense and income categories

interface Data {
  value: number;
  percentage: number;
  color: string;
  category: string;
  subcategory?: string;
  iconName?: string;
  iconSet?: string;
  transactionIds?: string[];
  type?: 'income' | 'expense';
}

const RADIUS = 130;
const STROKE_WIDTH = 20;
const OUTER_STROKE_WIDTH = 30;
const GAP = 0.03;

type PeriodType = 'month' | 'quarter' | 'year';

export default function BudgetScreen() {
  const [data, setData] = useState<Data[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [filterType, setFilterType] = useState<'Income' | 'Expense'>('Expense'); // {{ edit: Remove 'All' from filterType state }}
  const [totalValue, setTotalValue] = useState(0);
  const decimals = useSharedValue<number[]>([]);
  const navigation = useNavigation();
  const [allData, setAllData] = useState<Data[]>([]); // {{ edit: Add allData state }}

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
        const budgetSummary = result.total_amount;

        if (!Array.isArray(budgetSummary)) {
          throw new Error('Expected budgetSummary to be an array');
        }

        // Assign 'type' to each budget item based on category
        const categorizedBudgetSummary = budgetSummary.map((item: any) => {
          let category = expenseCategories.find(cat => cat.name.toLowerCase() === item.category.toLowerCase());
          let type: 'expense' | 'income' = 'expense';

          if (!category) {
            category = incomeCategories.find(cat => cat.name.toLowerCase() === item.category.toLowerCase());
            if (category) {
              type = 'income';
            }
          }

          if (!category) {
            console.warn(`Category "${item.category}" not found in expense or income categories.`);
            type = 'expense'; // Defaulting to 'expense'
          }

          return {
            ...item,
            type, // Assign the determined type
          };
        });

        // Filter based on filterType
        let filterBudgetSummary = categorizedBudgetSummary;
        if (filterType === 'Income') {
          filterBudgetSummary = categorizedBudgetSummary.filter(item => item.type === 'income');
        } else if (filterType === 'Expense') {
          filterBudgetSummary = categorizedBudgetSummary.filter(item => item.type === 'expense');
        }

        const total = filterBudgetSummary.reduce(
          (acc: number, currentValue: { amount: number }) => acc + currentValue.amount,
          0,
        );

        const generatePercentages = filterBudgetSummary.map((item: any) => {
          let category = expenseCategories.find(cat => cat.name.toLowerCase() === item.category.toLowerCase());
          let type: 'expense' | 'income' = 'expense';

          if (!category) {
            category = incomeCategories.find(cat => cat.name.toLowerCase() === item.category.toLowerCase());
            if (category) {
              type = 'income';
            }
          }

          if (!category) {
            console.warn(`Category "${item.category}" not found in expense or income categories.`);
            type = 'expense'; // Defaulting to 'expense'
          }

          return {
            value: parseFloat(item.amount.toFixed(2)),
            percentage: (item.amount / total) * 100,
            color: category?.color || '#cccccc',
            category: item.category,
            subcategory: item.subcategory,
            iconName: category?.iconName,
            iconSet: category?.iconSet,
            transactionIds: item.transactions_related,
            type: type,
          };
        });

        const significantSegments = generatePercentages.filter(item => item.percentage >= 3);
        const otherSegments = generatePercentages.filter(item => item.percentage < 3);

        const otherTotal = otherSegments.reduce((acc, item) => acc + item.value, 0);
        const otherPercentage = otherSegments.reduce((acc, item) => acc + item.percentage, 0);

        if (otherSegments.length > 0) {
          significantSegments.push({
            value: parseFloat(otherTotal.toFixed(2)),
            percentage: otherPercentage,
            color: '#cccccc',
            category: 'Other',
            iconName: 'help-circle-outline',
            iconSet: 'Ionicons',
            transactionIds: otherSegments.flatMap(item => item.transactionIds || []),
            type: 'expense',
          });
        }

        // Filter out "Virements internes" from significantSegments
        const filteredSegments = significantSegments.filter(item => item.category !== 'Virements internes');

        // Sort segments by value, ensuring 'Other' is always last
        filteredSegments.sort((a, b) => {
          if (a.category === 'Other') return 1;
          if (b.category === 'Other') return -1;
          return b.value - a.value;
        });

        const generateDecimals = filteredSegments.map(
          (item) => item.percentage / 100,
        );

        const totalDecimals = generateDecimals.reduce((acc, val) => acc + val, 0);
        const normalizedDecimals = generateDecimals.map((decimal) => decimal / totalDecimals);

        decimals.value = [...normalizedDecimals];

        setData(filteredSegments);
        setTotalValue(total)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentDate, periodType, filterType]);

  const formatPeriod = (date: Date, type: PeriodType) => {
    const options: Intl.DateTimeFormatOptions = {year: 'numeric'};
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

  const font = useFont(require('./../assets/fonts/Roboto-Bold.ttf'), 45);
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
              style={[
                styles.periodTypeButton,
                periodType === 'month' && styles.activePeriodType,
              ]}
            >
              <Text
                style={[
                  styles.periodTypeText,
                  periodType === 'month' && styles.activePeriodTypeText,
                ]}
              >
                Mois
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriodType('quarter')}
              style={[
                styles.periodTypeButton,
                periodType === 'quarter' && styles.activePeriodType,
              ]}
            >
              <Text
                style={[
                  styles.periodTypeText,
                  periodType === 'quarter' && styles.activePeriodTypeText,
                ]}
              >
                Trimestre
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setPeriodType('year')}
              style={[
                styles.periodTypeButton,
                periodType === 'year' && styles.activePeriodType,
              ]}
            >
              <Text
                style={[
                  styles.periodTypeText,
                  periodType === 'year' && styles.activePeriodTypeText,
                ]}
              >
                Année
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => changePeriod(1)} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </Pressable>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Expense</Text>
        <Switch
          value={filterType === 'Income'}
          onValueChange={(value) => setFilterType(value ? 'Income' : 'Expense')}
          thumbColor="white" // Thumb remains white for better contrast
          trackColor={{ false: '#FF3B30', true: '#34C759' }} // Red for Expense, Green for Income
          ios_backgroundColor="#FF0000"
        />
        <Text style={styles.filterLabel}>Income</Text>
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
            colors={data.map(item => item.color)}
            totalText={filterType === 'Income' ? 'Total Income' : 'Total Expense'}
          />
        </View>
        {data.map((item, index) => (
          <Pressable
            key={index}
            style={styles.legendItem}
            onPress={() => navigation.navigate('BudgetDetail', { category: item.category, subcategory: item.subcategory, transactionIds: item.transactionIds })}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
              {item.iconSet === 'Ionicons' && (
                <Ionicons name={item.iconName as any} size={16} color="white" />
              )}
            </View>
            <View style={styles.legendLabelContainer}>
              <Text style={styles.legendLabel} numberOfLines={1} ellipsizeMode="tail">
                {item.category}
              </Text>
              {item.subcategory && <Text style={styles.subCategoryLabel}>{item.subcategory}</Text>}
            </View>
            <Text style={styles.legendValue}>{item.value.toLocaleString()} €</Text>
          </Pressable>
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
    paddingHorizontal: 20,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  legendLabelContainer: {
    flex: 1, // Allow the label container to take up available space
    flexDirection: 'column',
    marginLeft: 10, // Add space between icons and labels
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1, // Allow the text to shrink if it's too long
  },
  subCategoryLabel: {
    fontSize: 12,
    color: '#666',
    flexShrink: 1, // Allow the text to shrink if it's too long
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    textAlign: 'right', // Align the value text to the right
    minWidth: 60, // Ensure there's enough space for the value
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
  // Add new styles for filter buttons
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10, // Spacing below date selection
  },
  filterLabel: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 10, // Spacing between label and Switch
  },
});
