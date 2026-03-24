/**
 * Stats screen.
 *
 * Shows per-die distribution and summary metrics for the equipped set
 * using the active die selection as the filter.
 *
 * ---
 * NOTE: This file was written with AI assistance (GitHub Copilot, GPT-5.3-Codex).
 * ---
 */

import { useEffect, useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { useDiceContext } from '../../DiceContext.js';
import { DiceTray } from '../../components/dice-tray.jsx';
import TexturedDieFace from '../../components/textured-die-face.jsx';
import { ThemedText } from '../../components/themed-text';
import { getDB } from '../../db/db.js';
import { getDiceSetStats, getRollDistribution } from '../../db/rollHistory.js';

const CHART_WIDTH = Math.max(Dimensions.get('window').width - 74, 246);
const CHART_HEIGHT = Math.max(Math.floor(Dimensions.get('window').height * 0.3), 188);

function createEmptyStats() {
  return {
    total_rolls: 0,
    average: null,
    min_roll: null,
    max_roll: null,
    max_rolls: 0,
    nat_1s: 0,
  };
}

function formatAverage(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '--';
  }
  return value.toFixed(1);
}

function buildStandardChartData(activeDieType, distribution) {
  const distributionByResult = new Map(
    distribution.map(function toEntry(entry) {
      return [entry.result, entry.count];
    })
  );

  const labels = [];
  const data = [];
  for (let face = 1; face <= activeDieType; face += 1) {
    labels.push(String(face));
    data.push(distributionByResult.get(face) ?? 0);
  }

  return { labels, data };
}

function buildD100ChartData(distribution) {
  const bins = Array.from({ length: 10 }, function createBin(_, index) {
    const start = index * 10 + 1;
    const end = index === 9 ? 100 : start + 9;
    return {
      label: `${start}-${end}`,
      count: 0,
    };
  });

  distribution.forEach(function applyEntry(entry) {
    const result = Number(entry.result);
    const count = Number(entry.count) || 0;
    if (result === 100) {
      bins[9].count += count;
      return;
    }
    const binIndex = Math.min(Math.floor((result - 1) / 10), 9);
    if (binIndex >= 0) {
      bins[binIndex].count += count;
    }
  });

  return {
    labels: bins.map(function getLabel(bin) {
      return bin.label;
    }),
    data: bins.map(function getCount(bin) {
      return bin.count;
    }),
  };
}

export default function StatsScreen() {
  const { activeDieType, equippedSetId, setActiveDieType } = useDiceContext();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [stats, setStats] = useState(createEmptyStats());
  const [distribution, setDistribution] = useState([]);
  const [setName, setSetName] = useState('Classic');
  const selectedSetId = equippedSetId ?? 1;

  useEffect(
    function loadSetNameEffect() {
      let isCancelled = false;

      async function loadSetName() {
        try {
          const database = await getDB();
          const row = await database.getFirstAsync('SELECT set_name FROM dice_sets WHERE id = ?', [
            selectedSetId,
          ]);
          if (isCancelled) {
            return;
          }
          setSetName(row?.set_name ? String(row.set_name) : 'Classic');
        } catch {
          if (!isCancelled) {
            setSetName('Classic');
          }
        }
      }

      void loadSetName();

      return function cleanupSetNameEffect() {
        isCancelled = true;
      };
    },
    [selectedSetId]
  );

  useEffect(
    function loadStatsEffect() {
      let isCancelled = false;

      async function loadStats() {
        setIsLoading(true);
        setErrorMessage('');
        try {
          const [nextStats, nextDistribution] = await Promise.all([
            getDiceSetStats(selectedSetId, activeDieType),
            getRollDistribution(selectedSetId, activeDieType),
          ]);

          if (isCancelled) {
            return;
          }

          setStats(nextStats ?? createEmptyStats());
          setDistribution(Array.isArray(nextDistribution) ? nextDistribution : []);
        } catch (error) {
          if (isCancelled) {
            return;
          }
          setErrorMessage(error?.message ?? 'Unable to load stats');
          setStats(createEmptyStats());
          setDistribution([]);
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      }

      void loadStats();

      return function cleanupStatsEffect() {
        isCancelled = true;
      };
    },
    [activeDieType, equippedSetId]
  );

  const chartData = useMemo(
    function createChartDataMemo() {
      return activeDieType === 100
        ? buildD100ChartData(distribution)
        : buildStandardChartData(activeDieType, distribution);
    },
    [activeDieType, distribution]
  );

  const resolvedChartWidth = activeDieType === 20 ? CHART_WIDTH - 12 : CHART_WIDTH;

  const displayLabels = useMemo(
    function displayLabelsMemo() {
      if (activeDieType !== 20) {
        return chartData.labels;
      }

      return chartData.labels.map(function mapD20Label(label, index) {
        if (index === 0 || index === chartData.labels.length - 1 || index % 2 === 0) {
          return label;
        }
        return '';
      });
    },
    [activeDieType, chartData.labels]
  );

  const hasHistory = Number(stats.total_rolls ?? 0) > 0;
  const chartDataset = chartData.data.every(function isZero(value) {
    return value === 0;
  })
    ? chartData.data.map(function zeroToPlaceholder() {
        return 0;
      })
    : chartData.data;

  return (
    <View style={styles.screen}>
      <View style={styles.headerBox}>
        <ThemedText style={styles.headerText}>{setName.toUpperCase()}</ThemedText>
      </View>

      <View style={styles.contentArea}>
        <View style={styles.dieCard}>
          <TexturedDieFace setId={selectedSetId} dieType={activeDieType} size={78} hideLabel />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: displayLabels,
                datasets: [{ data: chartDataset }],
              }}
              width={resolvedChartWidth}
              height={CHART_HEIGHT}
              fromZero
              withInnerLines
              withHorizontalLabels={false}
              withVerticalLabels
              showValuesOnTopOfBars={hasHistory}
              verticalLabelRotation={activeDieType === 100 ? -20 : activeDieType === 20 ? 0 : activeDieType >= 20 ? -12 : 0}
              xLabelsOffset={activeDieType === 100 ? -4 : activeDieType === 20 ? -5 : activeDieType >= 20 ? -2 : 0}
              yLabelsOffset={-10}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: function chartColor(opacity = 1) {
                  return `rgba(17, 17, 17, ${opacity})`;
                },
                labelColor: function labelColor(opacity = 1) {
                  return `rgba(17, 17, 17, ${opacity})`;
                },
                barPercentage: activeDieType === 20 ? 0.46 : activeDieType === 100 ? 0.64 : 0.75,
                fillShadowGradient: '#111111',
                fillShadowGradientOpacity: hasHistory ? 1 : 0.18,
                propsForBackgroundLines: {
                  stroke: '#d0d0d0',
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: activeDieType >= 20 ? 8 : activeDieType === 100 ? 9 : 10,
                },
              }}
              style={styles.chart}
            />

            {!hasHistory ? (
              <View style={styles.emptyChartOverlay} pointerEvents="none">
                <ThemedText style={styles.emptyChartText}>NO HISTORY</ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryLabel}>Rolls</ThemedText>
              <ThemedText style={styles.summaryValue}>{stats.total_rolls ?? 0}</ThemedText>
            </View>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryLabel}>Average</ThemedText>
              <ThemedText style={styles.summaryValue}>{formatAverage(stats.average)}</ThemedText>
            </View>
          </View>

          {isLoading ? <ThemedText style={styles.statusText}>Loading stats...</ThemedText> : null}
          {!isLoading && errorMessage.length > 0 ? (
            <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.trayArea}>
        <DiceTray activeDieType={activeDieType} onSelectDieType={setActiveDieType} setId={selectedSetId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    borderWidth: 4,
    borderColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerBox: {
    width: '100%',
    height: 50,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 0.8,
  },
  contentArea: {
    flex: 1,
    width: '100%',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dieCard: {
    width: '100%',
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  chartCard: {
    flex: 1,
    width: '100%',
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
    paddingTop: 4,
    position: 'relative',
  },
  chart: {
    marginTop: 0,
    marginLeft: -2,
    paddingTop: 12,
    paddingRight: 12,
  },
  emptyChartOverlay: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    color: '#111',
    fontWeight: '900',
    fontSize: 18,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 2,
  },
  summaryCard: {
    flex: 1,
    minHeight: 58,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: '#111',
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#111',
    fontWeight: '900',
    fontSize: 20,
    textTransform: 'uppercase',
  },
  statusText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  errorText: {
    color: '#8b0000',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  trayArea: {
    width: '100%',
    marginTop: 2,
  },
});
