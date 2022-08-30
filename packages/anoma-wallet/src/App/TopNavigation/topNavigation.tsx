import React, { useState, useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";
import {
  useNavigate,
  useLocation,
  NavigateFunction,
  Location,
} from "react-router-dom";
import { Persistor } from "redux-persist";
import { useAppDispatch, useAppSelector } from "store";

import {
  TopLevelRoute,
  StakingAndGovernanceSubRoute,
  locationToTopLevelRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";
import { Image, ImageName } from "components/Image";
import { Toggle } from "components/Toggle";
import { Select } from "components/Select";
import {
  TopNavigationContainer,
  LeftSection,
  MiddleSection,
  RightSection,
  MenuItem,
  MenuItemForSecondRow,
  MenuItemSubComponent,
  MenuItemTextContainer,
  ColorModeContainer,
  LogoContainer,
  OnlyInSmall,
  OnlyInMedium,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
  TopNavigationSecondRowInnerContainer,
  TopNavigationLogoContainer,
  MenuButton,
  MobileMenu,
  MobileMenuList,
  MobileMenuListItem,
  MobileMenuHeader,
  MenuCloseButton,
  SubMenuContainer,
} from "./topNavigation.components";

import { AppStore } from "store/store";
import { setChainId, SettingsState } from "slices/settings";
import TopNavigationLoggedIn from "./topNavigationLoggedIn";
import { SettingsButton } from "./topNavigationLoggedIn.components";
import { Icon, IconName } from "components/Icon";
import Config, { Chain } from "config";

/**
 * this is rendered in one of 2 places depending of the screen size
 */
const TopNavigationMenuItems = (props: {
  navigate: NavigateFunction;
}): React.ReactElement => {
  const { navigate } = props;
  const location = useLocation();
  const topLevelPath = `/${location.pathname.split("/")[1]}`;
  return (
    <>
      {/* Wallet */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Wallet}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Wallet}
      >
        <MenuItemTextContainer>Wallet</MenuItemTextContainer>
      </MenuItem>

      {/* Bridge */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Bridge}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Bridge}
      >
        <MenuItemTextContainer>Bridge</MenuItemTextContainer>
      </MenuItem>

      {/* Staking */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Staking}`);
        }}
        isSelected={topLevelPath === TopLevelRoute.Staking}
      >
        <MenuItemTextContainer>Staking</MenuItemTextContainer>
      </MenuItem>

      {/* Governance */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Governance}`);
        }}
        isSelected={topLevelPath === TopLevelRoute.Governance}
      >
        <MenuItemTextContainer>Governance</MenuItemTextContainer>
      </MenuItem>
    </>
  );
};

type SecondMenuRowProps = {
  location: Location;
  navigate: NavigateFunction;
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const SecondMenuRow = (props: SecondMenuRowProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { navigate, location, setIsLightMode } = props;
  const topLevelRoute = locationToTopLevelRoute(location);
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);
  const isSubMenuContentVisible = topLevelRoute === TopLevelRoute.Staking;
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  useEffect(() => {
    if (topLevelRoute === TopLevelRoute.Staking) {
      setIsLightMode(false);
    }
  });

  // callback func for select component
  const handleNetworkSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = event.target;
    dispatch(setChainId(value));
  };

  // transform for select component
  const chains = Object.values(Config.chain);
  const networks = Object.values(chains).map(({ id, alias }: Chain) => ({
    label: alias,
    value: id,
  }));

  return (
    <TopNavigationSecondRowInnerContainer
      spaceBetween={isSubMenuContentVisible}
    >
      {isSubMenuContentVisible && (
        <SubMenuContainer>
          <MenuItemForSecondRow
            onClick={() => {
              navigate(
                `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.Staking}`
              );
            }}
            isSelected={
              stakingAndGovernanceSubRoute ===
              StakingAndGovernanceSubRoute.Staking
            }
          >
            Staking
          </MenuItemForSecondRow>
          <MenuItemForSecondRow
            onClick={() => {
              navigate(
                `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.Governance}`
              );
            }}
            isSelected={
              stakingAndGovernanceSubRoute ===
              StakingAndGovernanceSubRoute.Governance
            }
          >
            Governance
          </MenuItemForSecondRow>
          <MenuItemForSecondRow
            onClick={() => {
              navigate(
                `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.PublicGoodsFunding}`
              );
            }}
            isSelected={
              stakingAndGovernanceSubRoute ===
              StakingAndGovernanceSubRoute.PublicGoodsFunding
            }
          >
            Public Goods Funding
          </MenuItemForSecondRow>
        </SubMenuContainer>
      )}

      <RightSection>
        <Select
          value={chainId}
          data={networks}
          onChange={handleNetworkSelect}
        />
      </RightSection>
    </TopNavigationSecondRowInnerContainer>
  );
};

type TopNavigationProps = {
  // this is for the toggle
  isLightMode: boolean;
  // cb for telling parent to change hte color in context
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn?: boolean;
  persistor?: Persistor;
  store?: AppStore;
  logout: () => void;
};

// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const {
    isLightMode,
    logout,
    setIsLightMode,
    isLoggedIn = false,
    store,
  } = props;
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();
  const topLevelRoute = locationToTopLevelRoute(location);
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);

  return (
    <TopNavigationContainer>
      <OnlyInMedium>
        <TopNavigationContainerRow>
          <LeftSection>
            &nbsp;
            {isLoggedIn && (
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "200px" }}
                  forceLightMode={true}
                />
              </LogoContainer>
            )}
          </LeftSection>

          <MiddleSection>
            {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
          </MiddleSection>

          <RightSection>
            {isLoggedIn && store && (
              <>
                <TopNavigationLoggedIn
                  isLightMode={isLightMode}
                  setIsLightMode={(isLightMode) => setIsLightMode(isLightMode)}
                  topLevelRoute={topLevelRoute}
                ></TopNavigationLoggedIn>

                <MenuItem
                  onClick={() => {
                    navigate(TopLevelRoute.Home);
                    logout();
                  }}
                >
                  <Icon iconName={IconName.Lock} />
                  <MenuItemTextContainer>Lock</MenuItemTextContainer>
                </MenuItem>
              </>
            )}
          </RightSection>
        </TopNavigationContainerRow>

        {/* sub menu */}
        {isLoggedIn && (
          <SecondMenuRow
            location={location}
            navigate={navigate}
            setIsLightMode={setIsLightMode}
          />
        )}

        <TopNavigationContainerSecondRow>
          {!isLoggedIn && (
            <TopNavigationLogoContainer>
              <SettingsButton>
                <Icon iconName={IconName.Settings} />
              </SettingsButton>
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "300px" }}
                />
              </LogoContainer>
              <ColorModeContainer>
                {topLevelRoute !== TopLevelRoute.Staking && (
                  <Toggle
                    checked={isLightMode}
                    onClick={() => {
                      setIsLightMode((isLightMode) => !isLightMode);
                    }}
                  />
                )}
              </ColorModeContainer>
            </TopNavigationLogoContainer>
          )}
        </TopNavigationContainerSecondRow>
      </OnlyInMedium>

      {/* mobile size */}
      <OnlyInSmall>
        <TopNavigationContainerRow>
          &nbsp;
          {isLoggedIn && (
            <>
              <LeftSection>
                <MenuButton onClick={() => setShowMenu(true)}>
                  <Icon
                    iconName={IconName.Menu}
                    strokeColorOverride={themeContext.colors.primary.main60}
                    fillColorOverride={themeContext.colors.primary.main60}
                  />
                </MenuButton>
              </LeftSection>
              <MiddleSection>
                <LogoContainer
                  onClick={() => {
                    navigate(TopLevelRoute.Home);
                  }}
                >
                  <Image
                    imageName={ImageName.Logo}
                    styleOverrides={{ maxWidth: "200px" }}
                    forceLightMode={true}
                  />
                </LogoContainer>
              </MiddleSection>
              <RightSection>
                {isLoggedIn && (
                  <ColorModeContainer>
                    {topLevelRoute !== TopLevelRoute.Staking && (
                      <Toggle
                        checked={isLightMode}
                        onClick={() => {
                          setIsLightMode((isLightMode) => !isLightMode);
                        }}
                      />
                    )}
                  </ColorModeContainer>
                )}
              </RightSection>
            </>
          )}
        </TopNavigationContainerRow>
        <TopNavigationContainerSecondRow>
          {isLoggedIn && store ? (
            <TopNavigationLoggedIn
              isLightMode={isLightMode}
              setIsLightMode={(isLightMode) => setIsLightMode(isLightMode)}
            ></TopNavigationLoggedIn>
          ) : (
            <TopNavigationLogoContainer>
              <SettingsButton>
                <Icon iconName={IconName.Settings} />
              </SettingsButton>
              <LogoContainer
                onClick={() => {
                  navigate(TopLevelRoute.Home);
                }}
              >
                <Image
                  imageName={ImageName.Logo}
                  styleOverrides={{ maxWidth: "300px" }}
                />
              </LogoContainer>
              <ColorModeContainer>
                {topLevelRoute !== TopLevelRoute.Staking && (
                  <Toggle
                    checked={isLightMode}
                    onClick={() => {
                      setIsLightMode((isLightMode) => !isLightMode);
                    }}
                  />
                )}
              </ColorModeContainer>
            </TopNavigationLogoContainer>
          )}
        </TopNavigationContainerSecondRow>
        <MobileMenu className={showMenu ? "active" : ""}>
          <MobileMenuHeader>
            <MenuCloseButton onClick={() => setShowMenu(false)}>
              <Icon
                iconName={IconName.ChevronLeft}
                strokeColorOverride={themeContext.colors.utility2.main60}
              />
            </MenuCloseButton>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "200px" }}
                forceLightMode={true}
              />
            </LogoContainer>
            <ColorModeContainer>
              {topLevelRoute !== TopLevelRoute.Staking && (
                <Toggle
                  checked={isLightMode}
                  onClick={() => {
                    setIsLightMode((isLightMode) => !isLightMode);
                  }}
                />
              )}
            </ColorModeContainer>
          </MobileMenuHeader>

          <MobileMenuList>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Home);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Wallet}
              >
                Wallet
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Bridge);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Bridge}
              >
                Bridge
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  setIsLightMode(false);
                  navigate(
                    `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.Staking}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.Staking
                }
              >
                Staking
              </MenuItemSubComponent>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  setIsLightMode(false);
                  navigate(
                    `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.Governance}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.Governance
                }
              >
                Governance
              </MenuItemSubComponent>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  setIsLightMode(false);
                  navigate(
                    `${TopLevelRoute.Staking}${StakingAndGovernanceSubRoute.PublicGoodsFunding}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.PublicGoodsFunding
                }
              >
                Public Goods Funding
              </MenuItemSubComponent>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Settings);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Settings}
              >
                Settings
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Home);
                  logout();
                }}
              >
                <Icon iconName={IconName.Lock} />
                <MenuItemTextContainer>Lock</MenuItemTextContainer>
              </MenuItem>
            </MobileMenuListItem>
          </MobileMenuList>
        </MobileMenu>
      </OnlyInSmall>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
