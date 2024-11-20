# 설치 및 실행방법

    1. npm install
    2. npm start

# 추가 구현사항

    1. 양쪽 클릭 기능 (Area Open)
        - 양쪽 마우스 동시 클릭시 확정적으로 지뢰가 없다고 판단되는 칸이 열립니다.
        - 조건에 충족하지 않을시 동작하지 않습니다.
        - 조건에 충족하더라도 깃발을 잘못 꽂아놨을시 지뢰를 밟으며 게임이 종료됩니다.

    2. 렌더링 최적화
        - useCallback 사용했습니다.

    3. 난이도 데이터 저장
        - localStorage 활용하여 난이도 데이터 새로고침 시에도 유지되도록 처리했습니다.

    3. 사용자 친화적인 UI/ UX
        - 커스텀 난이도 모달 사용했습니다.
        - 우클릭 기본이벤트 제한하여 우클릭 설정창이 열리지 않도록 처리했습니다.
