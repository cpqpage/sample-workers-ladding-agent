import { OUTLET_TYPE } from "$lib/constants";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals: { user, outlet } }) => {
    // 获取用户信息,安全起见,只返回需要的数据
    return {
        email: user.email,
        outletName: outlet.name,
        outletType: outlet.type,
        navigation: getNavigation(outlet.type)
    }
}

const getNavigation = (outletType: number) => {
    return [
        { label: 'layout.nav.home', href: '/app/dashboard', open: false, show: true },
        { 
          label: 'layout.nav.agentManagement',
          href: '/app/agents',
          children: [
            { label: 'layout.nav.agentList', href: '/list', show: outletType > Number(OUTLET_TYPE.NORMAL) },
            { label: 'layout.nav.agentUserList', href: '/users/list', show: true },
          ],
          open: false,
          show: true
        },
        { 
          label: 'layout.nav.productKeyManagement',
          href: '/app/productKeys',
          children: [
            { label: 'layout.nav.productKeyList', href: '/list', show: true },
            { label: 'layout.nav.productKeySettlement', href: '/settle', show: true },
          ],
          open: false,
          show: true
        },
        { 
          label: 'layout.nav.outletManagement',
          href: '/app/outlets',
          children: [
            { label: 'layout.nav.outletList', href: '/list', show: true },
          ],
          open: false,
          show: true
        },
        { 
          label: 'layout.nav.userManagement',
          href: '/app/users',
          children: [
            { label: 'layout.nav.userList', href: '/list', show: true },
            { label: 'layout.nav.loginLog', href: '/loginLog', show: outletType > Number(OUTLET_TYPE.REGIONAL) },
          ],
          open: false,
          show: true
        },
        { 
            label: 'layout.nav.smsManagement',
            href: '/app/sms',
            children: [
              { label: 'layout.nav.smsBalance', href: '/balance', show: true },
              { label: 'layout.nav.smsChargeList', href: '/chargeList', show: true },
              { label: 'layout.nav.smsSendList', href: '/sendList', show: true },
            ],
            open: false,
            show: outletType > Number(OUTLET_TYPE.REGIONAL)
          },
          { 
            label: 'layout.nav.marketingManagement',
            href: '#',
            children: [
              { label: 'layout.nav.salesRanking', href: '#', show: true },
            ],
            open: false,
            show: outletType > Number(OUTLET_TYPE.REGIONAL)
          },
          { 
          label: 'layout.nav.mobilePayment',
          href: '#',
          children: [
            { label: 'layout.nav.paymentApplyList', href: '/app/wxAlipayApplies', show: true },
            { label: 'layout.nav.merchantInfo', href: '/app/webPayInfos', show: true },
          ],
          open: false,
          show: true
        }
      ]
}
