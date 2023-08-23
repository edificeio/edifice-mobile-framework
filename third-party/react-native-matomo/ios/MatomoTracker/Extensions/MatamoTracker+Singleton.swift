//
//  MatamoTracker+Singleton.swift
//  BNFPiwik
//
//  Created by Pietro Santececca on 29.11.18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation


extension MatomoTracker {
    static let shared: MatomoTracker = MatomoTracker(siteId: "1", baseURL: URL(string: "https://example.com/piwik.php")!)
}

//extension MatomoTracker {
//
//    class func sharedInstanceWith(siteId: String, baseURL: URL) -> MatomoTracker {
//        struct Static {
//            static let instance: MatomoTracker = MatomoTracker()
//        }
//        return Static.instance
//    }
//
////    class func sharedInstanceWith(siteId: String, baseURL: URL) -> MatomoTracker {
////
////        let setupOnceToken: dispatch_once_t = 0
////
////        dispatch_once(&setupOnceToken) {
////            _sharedInstance = MatomoTracker(siteId: siteId, baseURL: baseURL)
////        }
////        return _sharedInstance
////    }
//
//}
