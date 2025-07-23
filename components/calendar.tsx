import type {
  CalendarMode,
  CalendarYearMonth,
  DayInfo,
} from "@/types/calendar";
import {
  getDaysInMonth,
  getNextYearMonth,
  getPrevYearMonth,
  getWeekIndexOfDate,
  groupDaysByWeek,
  isSelectedDateInCurrentMonth,
} from "@/utils/calendar";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

type DayType = (typeof DAYS)[number];

const { width: screenWidth } = Dimensions.get("window");
const CELL_MARGIN = 2;
const CONTAINER_PADDING = 32;
const COLUMNS = 7;
const cellWidth =
  (screenWidth - CONTAINER_PADDING - CELL_MARGIN * 2 * COLUMNS) / COLUMNS;
const cellHeight = cellWidth + CELL_MARGIN * 2;

interface CalendarCellProps {
  item: DayType | DayInfo;
  isSelected?: boolean;
  onPress?: () => void;
}

const CalendarCell = ({ item, isSelected, onPress }: CalendarCellProps) => {
  const cellStyle = useMemo(() => {
    if (typeof item === "string") {
      return item === "일"
        ? styles.sundayText
        : item === "토"
        ? styles.saturdayText
        : styles.headerText;
    }

    if (typeof item === "object" && "isCurrentMonth" in item) {
      if (!item.isCurrentMonth) {
        return styles.otherMonthText;
      }
    }

    return styles.dayText;
  }, [item]);

  const cellContainerStyle = useMemo(() => {
    return [styles.cellContainer, isSelected && styles.selectedCellContainer];
  }, [isSelected]);

  const displayText = useMemo(() => {
    if (typeof item === "string") return item;
    return item.day.toString();
  }, [item]);

  return (
    <Pressable
      style={cellContainerStyle}
      onPress={onPress}
      disabled={typeof item === "string"}
    >
      <Text style={cellStyle}>{displayText}</Text>
    </Pressable>
  );
};

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  onMonthChange?: (yearMonth: CalendarYearMonth) => void;
  currentYearMonth: CalendarYearMonth;
  selectedDate?: Date;
  mode?: CalendarMode;
  setMode: (mode: CalendarMode) => void;
}

const Calendar = ({
  onSelectDate,
  onMonthChange,
  currentYearMonth,
  selectedDate,
  mode = "month",
  setMode,
}: CalendarProps) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(() => {
    if (!selectedDate) return 0;

    if (isSelectedDateInCurrentMonth(selectedDate, currentYearMonth)) {
      return getWeekIndexOfDate(selectedDate, currentYearMonth);
    }
    return 0;
  });
  const calendarTranslateY = useSharedValue(0);
  const contentTranslateY = useSharedValue(0);

  const handlePrevMonth = () => {
    const prevYearMonth = getPrevYearMonth(currentYearMonth);
    onMonthChange?.(prevYearMonth);
    // 월 캘린더에서 월 변경시, 선택된 날짜가 해당 월에 포함되어 있다면 주 인덱스를 계산하여 세팅, 없다면 0으로 초기화
    if (mode === "month") {
      const isSelectedInCurrentMonth = isSelectedDateInCurrentMonth(
        selectedDate!,
        prevYearMonth
      );
      if (!isSelectedInCurrentMonth) {
        setCurrentWeekIndex(0);
        return;
      }
      setCurrentWeekIndex(getWeekIndexOfDate(selectedDate!, prevYearMonth));
    }
  };

  const handleNextMonth = () => {
    const nextYearMonth = getNextYearMonth(currentYearMonth);
    onMonthChange?.(nextYearMonth);
    // 월 캘린더에서 월 변경시, 선택된 날짜가 해당 월에 포함되어 있다면 주 인덱스를 계산하여 세팅, 없다면 0으로 초기화
    if (mode === "month") {
      const isSelectedInCurrentMonth = isSelectedDateInCurrentMonth(
        selectedDate!,
        nextYearMonth
      );
      if (!isSelectedInCurrentMonth) {
        setCurrentWeekIndex(0);
        return;
      }
      setCurrentWeekIndex(getWeekIndexOfDate(selectedDate!, nextYearMonth));
    }
  };

  const handlePrevWeek = () => {
    // 이전 달로 넘기는 경우
    const isFirstWeekOfMonth = currentWeekIndex === 0;
    if (isFirstWeekOfMonth) {
      handlePrevMonth();
      // 꽉 찬 첫 번째 주인 경우, 이전 달의 마지막 주로 세팅
      if (currentMonthWeeks[currentWeekIndex][0].isCurrentMonth) {
        setCurrentWeekIndex(prevMonthWeeks.length - 1);
        return;
      }
      // 이번 달의 첫 주와 이전 달의 마지막 주가 동일하므로, 이전 달의 둘째 주로 세팅
      setCurrentWeekIndex(prevMonthWeeks.length - 2);
      return;
    }

    setCurrentWeekIndex(currentWeekIndex - 1);
  };

  const handleNextWeek = () => {
    // 다음 달로 넘기는 경우
    const isLastWeekOfMonth = currentWeekIndex === currentMonthWeeks.length - 1;
    if (isLastWeekOfMonth) {
      handleNextMonth();
      // 꽉 찬 마지막 주인 경우
      if (currentMonthWeeks[currentWeekIndex][6].isCurrentMonth) {
        // 다음달의 첫 주로 세팅
        setCurrentWeekIndex(0);
        return;
      }
      // 다음달의 첫 주와 이번 달의 마지막주가 동일하므로, 다음달의 둘째 주로 세팅
      setCurrentWeekIndex(1);
      return;
    }

    setCurrentWeekIndex(currentWeekIndex + 1);
  };

  const handleSelectDate = (dayInfo: DayInfo) => {
    const date = dayInfo.date;
    onSelectDate(date);
    if (date.getMonth() !== currentYearMonth.month) {
      onMonthChange?.({
        year: date.getFullYear(),
        month: date.getMonth(),
      });
      setCurrentWeekIndex(
        getWeekIndexOfDate(date, {
          year: date.getFullYear(),
          month: date.getMonth(),
        })
      );
      return;
    }
    setCurrentWeekIndex(getWeekIndexOfDate(date, currentYearMonth));
  };

  const isDateSelected = (dayInfo: DayInfo): boolean => {
    if (!selectedDate) return false;

    return (
      selectedDate.getFullYear() === dayInfo.date.getFullYear() &&
      selectedDate.getMonth() === dayInfo.date.getMonth() &&
      selectedDate.getDate() === dayInfo.date.getDate()
    );
  };

  const currentMonthWeeks = useMemo(() => {
    const allDays = getDaysInMonth(
      currentYearMonth.year,
      currentYearMonth.month
    );
    return groupDaysByWeek(allDays);
  }, [currentYearMonth]);

  const prevMonthWeeks = useMemo(() => {
    const prevYearMonth = getPrevYearMonth(currentYearMonth);
    const allDays = getDaysInMonth(prevYearMonth.year, prevYearMonth.month);
    return groupDaysByWeek(allDays);
  }, [currentYearMonth]);

  // const nextMonthWeeks = useMemo(() => {
  //   const nextYearMonth = getNextYearMonth(currentYearMonth);
  //   const allDays = getDaysInMonth(nextYearMonth.year, nextYearMonth.month);
  //   return groupDaysByWeek(allDays);
  // }, [currentYearMonth]);

  const renderDay = ({ item }: { item: DayInfo }) => {
    return (
      <CalendarCell
        item={item}
        isSelected={isDateSelected(item)}
        onPress={() => handleSelectDate(item)}
      />
    );
  };

  const playAnimation = (translationY: number) => {
    "worklet";

    const shouldChangeMode = Math.abs(translationY) > 15;
    const targetMode = translationY < -15 ? "week" : "month";

    if (!shouldChangeMode) {
      // 모든 주를 원래 위치로 복원
      calendarTranslateY.value = withTiming(0, { duration: 200 });
      contentTranslateY.value = withTiming(0, { duration: 200 });
      return;
    }

    if (targetMode === "week") {
      // 마지막 애니메이션에 callback 추가
      contentTranslateY.value = withTiming(
        -cellHeight * (currentMonthWeeks.length - 1),
        // 0,
        { duration: 300 }
      );
      calendarTranslateY.value = withTiming(
        -cellHeight * currentWeekIndex,
        { duration: 300 },
        (finished) => {
          if (finished) {
            runOnJS(setMode)("week");
          }
        }
      );
    } else {
      // 월 모드로 복원
      calendarTranslateY.value = withTiming(
        0,
        { duration: 300 },
        (finished) => {
          if (finished) {
            runOnJS(setMode)("month");
          }
        }
      );
      contentTranslateY.value = withTiming(0, { duration: 300 });
    }
  };
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      // 실시간으로 gesture에 따라 translate 값 업데이트
      if (currentWeekIndex !== 0) {
        calendarTranslateY.value =
          calendarTranslateY.value + e.translationY / 100;
      }
      contentTranslateY.value = contentTranslateY.value + e.translationY / 80;
      // ((currentMonthWeeks.length - 1) * cellWidth * e.translationY) / 100;
    })
    .onEnd((e) => {
      // gesture가 끝나면 playAnimation 트리거
      playAnimation(e.translationY);
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.navButton}
          onPress={() => {
            if (mode === "month") {
              handlePrevMonth();
            } else {
              handlePrevWeek();
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#329EFF" />
        </Pressable>
        <Text style={styles.yearMonthText}>
          {`${currentYearMonth.year}년 ${currentYearMonth.month + 1}월`}
        </Text>
        <Pressable
          style={styles.navButton}
          onPress={() => {
            if (mode === "month") {
              handleNextMonth();
            } else {
              handleNextWeek();
            }
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="#329EFF" />
        </Pressable>
      </View>

      <View style={styles.daysHeader}>
        {DAYS.map((day) => (
          <CalendarCell key={day} item={day} />
        ))}
      </View>
      <GestureDetector gesture={gesture}>
        <View>
          <Animated.View
            style={{
              transform: [{ translateY: calendarTranslateY }],
              zIndex: 10,
            }}
          >
            {currentMonthWeeks.map((week, index) => {
              // if (mode === "week") {
              //   const isCurrentWeek = index === currentWeekIndex;
              //   if (!isCurrentWeek) return null;
              // }
              return (
                <Animated.FlatList
                  key={index}
                  data={week}
                  renderItem={renderDay}
                  keyExtractor={(item, index) =>
                    `${item.date.getTime()}-${index}`
                  }
                  numColumns={7}
                  scrollEnabled={false}
                  style={styles.weekContainer}
                />
              );
            })}
          </Animated.View>
          <Animated.View
            style={{
              transform: [{ translateY: contentTranslateY }],
              backgroundColor: "white",
              height: "100%",
              zIndex: 20,
            }}
          ></Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "#ffffff",
    paddingBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  yearMonthText: {
    fontSize: 18,
    fontWeight: "600",
  },
  daysHeader: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    zIndex: 10,
  },
  cellContainer: {
    width: cellWidth,
    aspectRatio: 1 / 1,
    justifyContent: "center",
    alignItems: "center",
    margin: CELL_MARGIN,
  },
  selectedCellContainer: {
    borderColor: "#b7b7b7",
    borderRadius: "100%",
    borderWidth: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sundayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6363",
  },
  saturdayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#329EFF",
  },
  dayText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  otherMonthText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#999",
  },
  weekContainer: {
    flexGrow: 0,
  },
});
