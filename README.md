# 버닛 프론트엔드 과제

React Native와 Expo를 사용한 인터랙티브 캘린더 애플리케이션입니다.

## 📱 주요 기능

### 🗓️ 인터랙티브 캘린더

- **월/주 모드 전환**: 제스처를 통한 자연스러운 뷰 모드 전환
- **부드러운 애니메이션**: React Native Reanimated를 활용한 60fps 애니메이션
- **직관적인 제스처**: 위/아래 스와이프로 월↔주 모드 전환
- **날짜 선택**: 터치로 날짜 선택 및 시각적 피드백
- **월 간 네비게이션**: 좌우 화살표로 이전/다음 달 이동

### 🎯 기술적 특징

- **성능 최적화**: SharedValue를 활용한 60fps 애니메이션
- **메모리 효율성**: useMemo를 통한 불필요한 리렌더링 방지
- **TypeScript**: 타입 안전성과 개발자 경험 향상
- **모듈화**: 재사용 가능한 컴포넌트 구조

## 🛠️ 기술 스택

- **Frontend Framework**: React Native 0.79
- **Development Platform**: Expo 53
- **Animation**: React Native Reanimated 3
- **Gesture Handling**: React Native Gesture Handler
- **Language**: TypeScript
- **Icons**: Expo Vector Icons

## 📁 프로젝트 구조

```
burnfit-test/
├── app/                    # 앱 라우팅 및 화면
│   ├── _layout.tsx        # 루트 레이아웃
│   └── (tabs)/            # 탭 네비게이션
│       ├── calendar.tsx   # 캘린더 화면
│       ├── index.tsx      # 홈 화면
│       ├── library.tsx    # 라이브러리 화면
│       └── mypage.tsx     # 마이페이지
├── components/            # 재사용 가능한 컴포넌트
│   └── calendar.tsx      # 캘린더 메인 컴포넌트
├── types/                # TypeScript 타입 정의
│   └── calendar.ts       # 캘린더 관련 타입
├── utils/                # 유틸리티 함수
│   └── calendar.ts       # 캘린더 로직
└── assets/               # 정적 자산 (이미지, 폰트)
```

## 🚀 시작하기

## 📱 사용법

### 캘린더 조작

- **날짜 선택**: 원하는 날짜를 터치
- **월 변경**: 상단의 좌우 화살표 버튼 사용
- **모드 전환**:
  - 위로 스와이프: 월 모드 → 주 모드
  - 아래로 스와이프: 주 모드 → 월 모드

### 제스처 가이드

- **부드러운 스와이프**: 자연스러운 애니메이션과 함께 모드 전환
- **임계값**: 15px 이상 스와이프해야 모드 변경 활성화
- **중간 취소**: 임계값 미달시 원래 모드로 복원

## 🎨 캘린더 컴포넌트 API

### Props

```typescript
interface CalendarProps {
  onSelectDate: (date: Date) => void; // 날짜 선택 콜백
  onMonthChange?: (yearMonth: CalendarYearMonth) => void; // 월 변경 콜백
  currentYearMonth: CalendarYearMonth; // 현재 표시 연월
  selectedDate?: Date; // 선택된 날짜
  mode?: CalendarMode; // 표시 모드 ('month' | 'week')
  setMode: (mode: CalendarMode) => void; // 모드 변경 함수
}
```

### 사용 예시

```typescript
import Calendar from "@/components/calendar";

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentYearMonth, setCurrentYearMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [mode, setMode] = useState<"month" | "week">("month");

  return (
    <Calendar
      onSelectDate={setSelectedDate}
      onMonthChange={setCurrentYearMonth}
      currentYearMonth={currentYearMonth}
      selectedDate={selectedDate}
      mode={mode}
      setMode={setMode}
    />
  );
};
```

## 🔧 개발 정보

### 주요 파일 설명

- **`components/calendar.tsx`**: 메인 캘린더 컴포넌트
- **`utils/calendar.ts`**: 날짜 계산 및 유틸리티 함수
- **`types/calendar.ts`**: 캘린더 관련 TypeScript 타입 정의

### 애니메이션 구현

```typescript
// Gesture Handler를 활용한 자연스러운 제스처 처리
const gesture = Gesture.Pan()
  .onUpdate((e) => {
    calendarTranslateY.value = e.translationY;
    contentTranslateY.value =
      ((currentMonthWeeks.length - 1) * cellWidth * e.translationY) / 100;
  })
  .onEnd((e) => {
    playAnimation(e.translationY);
  });
```

## 아쉬운 점

- 주 단위 캘린더 뷰로 제스처를 통해 진입하는 기능까지 구현은 했지만, 해당 모드에서 주 단위 이동을 구현하지 못한점이 아쉬움이 남습니다.
- 캐러셀 뷰처럼 좌우 스와이프를 통하여 월, 주 단위 이동을 구현하지 못한점이 아쉽습니다.
