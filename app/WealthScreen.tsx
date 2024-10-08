import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from "react-native";
import { LineChart } from 'react-native-gifted-charts';
import { fetchWealthData } from "./api/bankApi";

interface DataPoint {
    value: number;
    date: string;
}

export default function WealthScreen() {
    const [selectedRange, setSelectedRange] = useState("1Y");
    const [wealthData, setWealthData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const endDate = new Date();
                const startDate = new Date();

                switch (selectedRange) {
                    case "1M":
                        startDate.setMonth(startDate.getMonth() - 1);
                        break;
                    case "3M":
                        startDate.setMonth(startDate.getMonth() - 3);
                        break;
                    case "6M":
                        startDate.setMonth(startDate.getMonth() - 6);
                        break;
                    case "1Y":
                        startDate.setFullYear(startDate.getFullYear() - 1);
                        break;
                    case "3Y":
                        startDate.setFullYear(startDate.getFullYear() - 3);
                        break;
                    case "5Y":
                        startDate.setFullYear(startDate.getFullYear() - 5);
                        break;
                    case "Max":
                        startDate.setFullYear(2000);
                        break;
                    default:
                        break;
                }

                const data = await fetchWealthData(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
                setWealthData(data);
            } catch (error) {
                console.error("Error fetching wealth data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [selectedRange]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    const formatData = (): DataPoint[] => {
        return Object.entries(wealthData).map(([date, value]) => ({
            value: parseFloat(value.toFixed(2)),
            date
        }));
    };

    const calculateMaxPoints = (dataLength: number): number => {
        // Fonction exponentielle décroissante pour calculer le nombre maximum de points
        const baseMax = 250; // Nombre maximum de points pour un petit ensemble de données
        const minMax = 100; // Nombre minimum de points pour un grand ensemble de données
        const decayFactor = 0.0005; // Facteur de décroissance, ajustez selon vos besoins

        return Math.max(
            Math.floor(baseMax * Math.exp(-decayFactor * dataLength)),
            minMax
        );
    };

    const reduceDataPoints = (data: DataPoint[]): DataPoint[] => {
        const maxPoints = calculateMaxPoints(data.length);
        if (data.length <= maxPoints) return data;
        const interval = Math.ceil(data.length / maxPoints);
        return data.filter((_, index) => index % interval === 0);
    };

    const data = reduceDataPoints(formatData());
    
    const minValue = () => {
        const maxValue = Math.max(...data.map(point => point.value));
        const minValue = Math.min(...data.map(point => point.value));
        const valueRange = maxValue - minValue;
        const value = minValue - (valueRange * 0.3)
        if (value < 0) {
            return 0;
        }
        return value;
    };

    const screenWidth = Dimensions.get('window').width;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Wealth over time</Text>
            <Text style={styles.subtitle}>from {Object.keys(wealthData)[0]} to {Object.keys(wealthData)[Object.keys(wealthData).length - 1]}</Text>
            <View style={styles.buttonContainer}>
                {["1M", "3M", "6M", "1Y", "3Y", "5Y", "Max"].map((range) => (
                    <TouchableOpacity
                        key={range}
                        style={[
                            styles.button,
                            selectedRange === range && styles.selectedButton,
                        ]}
                        onPress={() => setSelectedRange(range)}
                    >
                        <Text style={styles.buttonText}>{range}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.graphContainer}>
                <LineChart
                    areaChart
                    data={data}
                    width={screenWidth - 20}
                    height={300}
                    adjustToWidth={true}
                    color="#007AFF"
                    thickness={2}
                    startFillColor={'rgba(84,219,234,0.3)'}
                    endFillColor={'rgba(84,219,234,0.01)'}
                    startOpacity={0.9}
                    endOpacity={0.2}
                    initialSpacing={0}
                    noOfSections={5}
                    yAxisOffset={minValue()}
                    yAxisColor="transparent"
                    xAxisColor="transparent"
                    yAxisTextStyle={{ color: 'gray' }}
                    xAxisTextStyle={{ color: 'gray' }}
                    hideRules
                    hideDataPoints
                    showVerticalLines={false}
                    xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                    yAxisTextNumberOfLines={1}
                    yAxisLabelSuffix="€"
                    yAxisLabelPrefix=""
                    rulesType="solid"
                    xAxisThickness={0}
                    rulesColor="rgba(0, 0, 0, 0.1)"
                    curved
                    animateOnDataChange
                    animationDuration={1000}
                    pointerConfig={{
                        showPointerStrip: true,
                        pointerStripWidth: 2,
                        pointerStripUptoDataPoint: true,
                        pointerStripColor: 'rgba(0, 0, 0, 0.5)',
                        width: 10,
                        height: 10,
                        color: '#007AFF',
                        radius: 6,
                        pointerLabelWidth: 150,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: false,
                        autoAdjustPointerLabelPosition: false,
                        pointerLabelComponent: (items: any) => {
                            const item = items[0];
                            return (
                                <View style={styles.tooltipContainer}>
                                    <Text style={styles.tooltipValue}>{item.value.toFixed(0)} €</Text>
                                    <Text style={styles.tooltipDate}>{new Date(item.date).toDateString()}</Text>
                                </View>
                            );
                        },
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    button: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        color: '#000',
    },
    graphContainer: {
        height: 300,
        width: '100%',
        marginVertical: 20,
    },
    tooltipContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: '#007AFF',
        borderWidth: 1,
    },
    tooltipValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    tooltipDate: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
});